const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const fs = require('fs');

const models = require('./models');
const crud = require('./routes/crud');
const { requireAdmin } = require('./middleware/auth');
const storage = require('./storage');

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('Missing MONGODB_URI or JWT_SECRET. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

// Disable Mongoose command buffering so queries fail-fast when offline instead of hanging
mongoose.set('bufferCommands', false);

const app = express();
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',').map((s) => s.trim()) : true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) =>
  res.json({
    ok: true,
    db: mongoose.connection.readyState === 1,
    ip: '117.236.139.6',
    membersCount: storage.getData('members').length,
  })
);

app.use('/api/auth', require('./routes/auth'));

/* ---- Site settings (single document) ---- */
app.get('/api/settings', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        const s = await models.Setting.findOne({ key: 'site' }).lean();
        if (s?.data && Object.keys(s.data).length > 0) return res.json(s.data);
      } catch (err) {
        console.warn('DB settings read failed, using local:', err.message);
      }
    }
    res.json(storage.getData('settings'));
  } catch (e) {
    res.json(storage.getData('settings'));
  }
});

app.put('/api/settings', requireAdmin, async (req, res, next) => {
  try {
    storage.setData('settings', req.body);
    if (mongoose.connection.readyState === 1) {
      try {
        await models.Setting.findOneAndUpdate(
          { key: 'site' },
          { key: 'site', data: req.body },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        );
      } catch (err) {
        console.warn('DB settings write failed, local updated:', err.message);
      }
    }
    res.json(req.body);
  } catch (e) {
    next(e);
  }
});

/* ---- Editable content collections with automatic fallback ---- */
app.use('/api/dates', crud(models.ImportantDate, { order: 1, date: 1 }, 'dates'));
app.use('/api/tracks', crud(models.Track, { order: 1 }, 'tracks'));
app.use('/api/members', crud(models.Member, { order: 1 }, 'members'));

/* ---- Forms (public POST, admin read) ---- */
app.use('/api', require('./routes/forms'));

/* ---- Admin dashboard numbers ---- */
app.get('/api/stats', requireAdmin, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      try {
        const [submissions, messages, unread, accepted] = await Promise.all([
          models.Submission.countDocuments(),
          models.Message.countDocuments(),
          models.Message.countDocuments({ read: false }),
          models.Submission.countDocuments({ status: { $in: ['accepted', 'camera-ready'] } }),
        ]);
        return res.json({ submissions, messages, unread, accepted });
      } catch (err) {
        console.warn('DB stats failed, using local:', err.message);
      }
    }
    const subs = storage.getData('submissions');
    const msgs = storage.getData('messages');
    res.json({
      submissions: subs.length,
      messages: msgs.length,
      unread: msgs.filter((m) => !m.read).length,
      accepted: subs.filter((s) => ['accepted', 'camera-ready'].includes(s.status)).length,
    });
  } catch (e) {
    next(e);
  }
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

/* ---- Serve built frontend in production ---- */
const dist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

/* ---- Errors ---- */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: Object.values(err.errors).map((e) => e.message).join(', ') });
  }
  if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid value or id' });
  if (err.code === 11000) return res.status(409).json({ error: 'Duplicate entry' });
  if (err.name === 'MulterError' || err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));

let connecting = false;
function connectDb() {
  if (connecting || mongoose.connection.readyState === 1) return;
  connecting = true;
  mongoose
    .connect(process.env.MONGODB_URI, {
      tlsAllowInvalidCertificates: true,
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
      connecting = false;
      console.log('Connected to MongoDB Atlas');
    })
    .catch((err) => {
      connecting = false;
      // Silence continuous log flooding, retry in 10 seconds
      setTimeout(connectDb, 10000);
    });
}

connectDb();
