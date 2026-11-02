const express = require('express');
const mongoose = require('mongoose');
const { requireAdmin } = require('../middleware/auth');
const storage = require('../storage');

// Full read & admin write support for both MongoDB Atlas and resilient local storage
module.exports = (Model, sort = { order: 1, createdAt: 1 }, key = null) => {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      if (mongoose.connection.readyState === 1) {
        const data = await Model.find().sort(sort).lean();
        if (data && data.length > 0) return res.json(data);
      }
      if (key) {
        return res.json(storage.getData(key));
      }
      res.json([]);
    } catch (e) {
      if (key) return res.json(storage.getData(key));
      next(e);
    }
  });

  router.post('/', requireAdmin, async (req, res, next) => {
    try {
      if (mongoose.connection.readyState === 1) {
        try {
          const doc = await Model.create(req.body);
          if (key) storage.addItem(key, doc.toObject ? doc.toObject() : doc);
          return res.status(201).json(doc);
        } catch (dbErr) {
          console.warn('DB create failed, using local:', dbErr.message);
        }
      }
      if (key) {
        const item = storage.addItem(key, req.body);
        return res.status(201).json(item);
      }
      res.status(400).json({ error: 'Database unavailable' });
    } catch (e) {
      next(e);
    }
  });

  router.put('/:id', requireAdmin, async (req, res, next) => {
    try {
      if (mongoose.connection.readyState === 1 && !String(req.params.id).startsWith('loc_') && !String(req.params.id).startsWith('d') && !String(req.params.id).startsWith('m_') && !String(req.params.id).startsWith('t_')) {
        try {
          const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
          });
          if (doc) {
            if (key) storage.updateItem(key, req.params.id, req.body);
            return res.json(doc);
          }
        } catch (dbErr) {
          console.warn('DB update failed, using local:', dbErr.message);
        }
      }
      if (key) {
        const updated = storage.updateItem(key, req.params.id, req.body);
        if (updated) return res.json(updated);
      }
      res.status(404).json({ error: 'Not found' });
    } catch (e) {
      next(e);
    }
  });

  router.delete('/:id', requireAdmin, async (req, res, next) => {
    try {
      if (mongoose.connection.readyState === 1 && !String(req.params.id).startsWith('loc_')) {
        try {
          await Model.findByIdAndDelete(req.params.id);
        } catch (dbErr) {
          console.warn('DB delete failed, using local:', dbErr.message);
        }
      }
      if (key) {
        storage.deleteItem(key, req.params.id);
      }
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  return router;
};
