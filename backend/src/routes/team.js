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

// GET /api/team - Public
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM team_members ORDER BY display_order ASC, id ASC');
    
    const core = rows.filter(m => m.category === 'core');
    const subcore = rows.filter(m => m.category === 'subcore');
    
    res.json({ core, subcore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching team members' });
  }
});

// POST /api/team - Admin
router.post('/', authenticateToken, upload.single('image'), optimizeImage, async (req, res) => {
  try {
    const { name, position, category } = req.body;
    let imageUrl = null;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    if (!name || !position || !category) {
      if (req.file) deleteImage(imageUrl); // rollback image
      return res.status(400).json({ message: 'Name, position, and category are required' });
    }

    const [result] = await db.query(
      'INSERT INTO team_members (name, position, image_url, category) VALUES (?, ?, ?, ?)',
      [name, position, imageUrl, category]
    );

    res.status(201).json({ id: result.insertId, message: 'Team member added successfully' });
  } catch (err) {
    console.error(err);
    if (req.file) deleteImage(`/uploads/${req.file.filename}`);
    res.status(500).json({ message: 'Server error adding team member' });
  }
});

// PUT /api/team/:id - Admin
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, category } = req.body;

    await db.query(
      'UPDATE team_members SET name = ?, position = ?, category = ? WHERE id = ?',
      [name, position, category, id]
    );

    res.json({ message: 'Team member updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating team member' });
  }
});

// PUT /api/team/:id/image - Admin
router.put('/:id/image', authenticateToken, upload.single('image'), optimizeImage, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const newImageUrl = `/uploads/${req.file.filename}`;

    // Get old image URL to delete it
    const [rows] = await db.query('SELECT image_url FROM team_members WHERE id = ?', [id]);
    
    await db.query('UPDATE team_members SET image_url = ? WHERE id = ?', [newImageUrl, id]);

    if (rows.length > 0 && rows[0].image_url) {
      deleteImage(rows[0].image_url);
    }

    res.json({ message: 'Image updated successfully', imageUrl: newImageUrl });
  } catch (err) {
    console.error(err);
    if (req.file) deleteImage(`/uploads/${req.file.filename}`);
    res.status(500).json({ message: 'Server error updating image' });
  }
});

// DELETE /api/team/:id - Admin
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query('SELECT image_url FROM team_members WHERE id = ?', [id]);
    
    await db.query('DELETE FROM team_members WHERE id = ?', [id]);

    if (rows.length > 0 && rows[0].image_url) {
      deleteImage(rows[0].image_url);
    }

    res.json({ message: 'Team member deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting team member' });
  }
});

// PUT /api/team/reorder - Admin
router.put('/reorder', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, display_order }
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Items array is required' });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      for (const item of items) {
        await connection.query('UPDATE team_members SET display_order = ? WHERE id = ?', [item.display_order, item.id]);
      }
      
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    res.json({ message: 'Reordered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error reordering team members' });
  }
});

module.exports = router;
