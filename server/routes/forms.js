const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const { Submission, Message, Setting } = require('../models');
const { requireAdmin } = require('../middleware/auth');
const storage = require('../storage');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.doc' || ext === '.docx') cb(null, true);
    else cb(new Error('Only PDF, DOC, or DOCX files are allowed'));
  },
});

const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please try again later.' },
});

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || ''));
const clean = (v, max = 5000) => String(v ?? '').trim().slice(0, max);

async function isOpen(flag) {
  if (mongoose.connection.readyState !== 1) {
    const s = storage.getData('settings');
    return s?.[flag] !== false;
  }
  try {
    const s = await Setting.findOne({ key: 'site' }).lean();
    return s?.data?.[flag] !== false;
  } catch {
    return true;
  }
}

/* ---------------- Paper submissions ---------------- */

router.post('/submissions', formLimiter, upload.single('paper'), async (req, res, next) => {
  try {
    if (!(await isOpen('submissionOpen')))
      return res.status(403).json({ error: 'Paper submission is currently closed.' });

    let authors = [];
    if (req.body.author) {
      authors = [
        {
          name: clean(req.body.author, 200),
          email: clean(req.body.email, 200),
          affiliation: clean(req.body.institution, 300),
        },
      ];
    } else {
      try {
        authors = JSON.parse(req.body.authors || '[]');
      } catch {
        return res.status(400).json({ error: 'Invalid authors data' });
      }
      authors = (Array.isArray(authors) ? authors : [])
        .map((a) => ({
          name: clean(a.name, 200),
          email: clean(a.email, 200),
          affiliation: clean(a.affiliation, 300),
        }))
        .filter((a) => a.name);
    }

    const title = clean(req.body.title, 400);
    const abstract = clean(req.body.abstract || req.body.message || title, 5000);
    const correspondingEmail = clean(req.body.email || req.body.correspondingEmail, 200);
    const institution = clean(req.body.institution, 300);
    const message = clean(req.body.message, 5000);

    if (!title) return res.status(400).json({ error: 'Paper title is required' });
    if (!authors.length || !authors[0].name) return res.status(400).json({ error: 'Please enter author name' });
    if (!emailOk(correspondingEmail))
      return res.status(400).json({ error: 'A valid corresponding author email is required' });
    if (!req.file) return res.status(400).json({ error: 'Please upload your paper as a PDF, DOC, or DOCX' });

    const localList = storage.getData('submissions');
    const paperId = `P-${String(localList.length + 1).padStart(4, '0')}-${Math.random()
      .toString(36)
      .slice(2, 5)
      .toUpperCase()}`;

    const record = {
      paperId,
      title,
      abstract,
      keywords: clean(req.body.keywords, 500),
      track: clean(req.body.track, 200),
      authors,
      correspondingEmail,
      institution,
      message,
      file: req.file.filename,
      originalName: req.file.originalname,
      status: 'submitted',
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const created = await Submission.create(record);
        record._id = created._id;
      } catch (err) {
        console.warn('DB submission save failed, stored locally:', err.message);
      }
    }

    storage.addItem('submissions', record);

    res.status(201).json({ ok: true, paperId });
  } catch (e) {
    if (req.file) fs.unlink(req.file.path, () => { });
    next(e);
  }
});

router.get('/submissions', requireAdmin, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const list = await Submission.find().sort({ createdAt: -1 }).lean();
      if (list && list.length > 0) return res.json(list);
    }
    res.json(storage.getData('submissions'));
  } catch (e) {
    res.json(storage.getData('submissions'));
  }
});

router.get('/submissions/:id/file', requireAdmin, async (req, res, next) => {
  try {
    let s = null;
    if (mongoose.connection.readyState === 1 && !String(req.params.id).startsWith('loc_')) {
      try {
        s = await Submission.findById(req.params.id).lean();
      } catch { }
    }
    if (!s) {
      const list = storage.getData('submissions');
      s = list.find((x) => String(x._id) === String(req.params.id));
    }
    if (!s || !s.file) return res.status(404).json({ error: 'File not found' });
    const full = path.join(uploadDir, path.basename(s.file));
    if (!fs.existsSync(full)) return res.status(404).json({ error: 'File missing on server' });
    res.download(full, s.originalName || `${s.paperId}.pdf`);
  } catch (e) {
    next(e);
  }
});

/* ---------------- Contact messages ---------------- */

router.post('/messages', formLimiter, async (req, res, next) => {
  try {
    const b = req.body || {};
    const name = clean(b.name, 200);
    const email = clean(b.email, 200);
    const message = clean(b.message, 3000);
    if (!name || !message) return res.status(400).json({ error: 'Name and message are required' });
    if (!emailOk(email)) return res.status(400).json({ error: 'A valid email is required' });

    const record = {
      name,
      email,
      subject: clean(b.subject, 300) || 'General enquiry',
      message,
      read: false,
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const created = await Message.create(record);
        record._id = created._id;
      } catch (err) {
        console.warn('DB message save failed, stored locally:', err.message);
      }
    }

    storage.addItem('messages', record);

    res.status(201).json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.get('/messages', requireAdmin, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const list = await Message.find().sort({ createdAt: -1 }).lean();
      if (list && list.length > 0) return res.json(list);
    }
    res.json(storage.getData('messages'));
  } catch (e) {
    res.json(storage.getData('messages'));
  }
});

/* ---------------- Status change & delete ---------------- */

router.patch('/submissions/:id', requireAdmin, async (req, res, next) => {
  try {
    const valid = ['submitted', 'under-review', 'accepted', 'rejected', 'camera-ready'];
    if (req.body.status && !valid.includes(req.body.status))
      return res.status(400).json({ error: 'Invalid status' });

    let updated = null;
    if (mongoose.connection.readyState === 1 && !String(req.params.id).startsWith('loc_')) {
      try {
        updated = await Submission.findByIdAndUpdate(req.params.id, req.body, { new: true });
      } catch { }
    }
    const local = storage.updateItem('submissions', req.params.id, req.body);
    res.json(updated || local || { ok: true });
  } catch (e) {
    next(e);
  }
});

router.delete('/submissions/:id', requireAdmin, async (req, res, next) => {
  try {
    let s = null;
    if (mongoose.connection.readyState === 1 && !String(req.params.id).startsWith('loc_')) {
      try {
        s = await Submission.findByIdAndDelete(req.params.id);
      } catch { }
    }
    storage.deleteItem('submissions', req.params.id);
    if (s?.file) fs.unlink(path.join(uploadDir, path.basename(s.file)), () => { });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

router.patch('/messages/:id', requireAdmin, async (req, res, next) => {
  try {
    let updated = null;
    if (mongoose.connection.readyState === 1 && !String(req.params.id).startsWith('loc_')) {
      try {
        updated = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
      } catch { }
    }
    const local = storage.updateItem('messages', req.params.id, req.body);
    res.json(updated || local || { ok: true });
  } catch (e) {
    next(e);
  }
});

router.delete('/messages/:id', requireAdmin, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1 && !String(req.params.id).startsWith('loc_')) {
      try {
        await Message.findByIdAndDelete(req.params.id);
      } catch { }
    }
    storage.deleteItem('messages', req.params.id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

module.exports = router;
