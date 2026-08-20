const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');
const { upload, optimizeImage } = require('../middleware/upload');

// Helper to delete an image file safely
const deleteImage = (imageUrl) => {
  if (imageUrl) {
    const filename = path.basename(imageUrl);
    const filepath = path.join(process.env.UPLOAD_DIR || './uploads', filename);
    if (fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
      } catch (err) {
        console.error('Failed to delete old image:', err);
      }
    }
  }
};

// GET /api/events - Public (All events)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM events ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching events' });
  }
});

// GET /api/events/featured - Public (Featured events only)
router.get('/featured', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM events WHERE is_featured = true ORDER BY featured_order ASC, created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching featured events' });
  }
});

// POST /api/events - Admin
router.post('/', authenticateToken, upload.single('image'), optimizeImage, async (req, res) => {
  try {
    const { title, description, date, location, is_featured } = req.body;
    let imageUrl = null;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    if (!title) {
      if (req.file) deleteImage(imageUrl);
      return res.status(400).json({ message: 'Title is required' });
    }

    const featured = is_featured === 'true' || is_featured === true ? 1 : 0;

    const [result] = await db.query(
      'INSERT INTO events (title, description, date, location, image_url, is_featured) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description || '', date || '', location || '', imageUrl, featured]
    );

    res.status(201).json({ id: result.insertId, message: 'Event added successfully' });
  } catch (err) {
    console.error(err);
    if (req.file) deleteImage(`/uploads/${req.file.filename}`);
    res.status(500).json({ message: 'Server error adding event' });
  }
});

// PUT /api/events/:id - Admin
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, location } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    await db.query(
      'UPDATE events SET title = ?, description = ?, date = ?, location = ? WHERE id = ?',
      [title, description || '', date || '', location || '', id]
    );

    res.json({ message: 'Event updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating event' });
  }
});

// PUT /api/events/:id/image - Admin
router.put('/:id/image', authenticateToken, upload.single('image'), optimizeImage, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const newImageUrl = `/uploads/${req.file.filename}`;

    const [rows] = await db.query('SELECT image_url FROM events WHERE id = ?', [id]);
    
    await db.query('UPDATE events SET image_url = ? WHERE id = ?', [newImageUrl, id]);

    if (rows.length > 0 && rows[0].image_url) {
      deleteImage(rows[0].image_url);
    }

    res.json({ message: 'Event image updated successfully', imageUrl: newImageUrl });
  } catch (err) {
    console.error(err);
    if (req.file) deleteImage(`/uploads/${req.file.filename}`);
    res.status(500).json({ message: 'Server error updating image' });
  }
});

// PUT /api/events/:id/featured - Admin
router.put('/:id/featured', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_featured } = req.body;

    const featured = is_featured === 'true' || is_featured === true ? 1 : 0;

    await db.query('UPDATE events SET is_featured = ? WHERE id = ?', [featured, id]);

    res.json({ message: `Event marked as ${featured ? 'featured' : 'not featured'}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error toggling featured status' });
  }
});

// DELETE /api/events/:id - Admin
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query('SELECT image_url FROM events WHERE id = ?', [id]);
    
    await db.query('DELETE FROM events WHERE id = ?', [id]);

    if (rows.length > 0 && rows[0].image_url) {
      deleteImage(rows[0].image_url);
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting event' });
  }
});

module.exports = router;
