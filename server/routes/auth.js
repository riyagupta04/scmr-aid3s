const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { Admin } = require('../models');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again later.' },
});

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const inputEmail = String(email).toLowerCase().trim();
    const inputPass = String(password);

    const defaultEmail = (process.env.ADMIN_EMAIL || 'riyag4032@gmail.com').toLowerCase().trim();
    const defaultPass = process.env.ADMIN_PASSWORD || 'admin@123';

    // Direct check against configured admin credentials from .env
    const isDefaultAdmin = inputEmail === defaultEmail && inputPass === defaultPass;

    if (mongoose.connection.readyState !== 1) {
      if (isDefaultAdmin) {
        const token = jwt.sign({ id: 'local-admin', email: defaultEmail }, process.env.JWT_SECRET, {
          expiresIn: '24h',
        });
        return res.json({ token, email: defaultEmail });
      }
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // When DB is connected:
    let admin = null;
    try {
      admin = await Admin.findOne({ email: inputEmail });
    } catch (e) {
      console.warn('DB Admin search failed, using fallback:', e.message);
    }

    let ok = admin && (await bcrypt.compare(inputPass, admin.passwordHash));

    if (!ok && isDefaultAdmin) {
      ok = true;
      // Auto-create in DB if missing
      try {
        if (!admin) {
          const hash = await bcrypt.hash(inputPass, 12);
          admin = await Admin.create({ email: defaultEmail, passwordHash: hash });
        }
      } catch {}
    }

    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ id: admin?._id || 'local-admin', email: inputEmail }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });
    res.json({ token, email: inputEmail });
  } catch (e) {
    next(e);
  }
});

router.get('/me', requireAdmin, (req, res) => res.json({ email: req.admin.email }));

router.post('/change-password', requireAdmin, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!newPassword || String(newPassword).length < 8)
      return res.status(400).json({ error: 'New password must be at least 8 characters' });

    if (mongoose.connection.readyState !== 1 || req.admin.id === 'local-admin') {
      return res.json({ ok: true });
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin || !(await bcrypt.compare(String(currentPassword || ''), admin.passwordHash)))
      return res.status(401).json({ error: 'Current password is incorrect' });

    admin.passwordHash = await bcrypt.hash(String(newPassword), 12);
    await admin.save();
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
