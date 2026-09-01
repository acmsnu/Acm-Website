const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Submit a new score
router.post('/', async (req, res) => {
  try {
    const { player_id, nickname, game, score, difficulty } = req.body;

    if (!player_id || !nickname || !game || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (nickname.length > 20) {
      return res.status(400).json({ error: 'Nickname too long' });
    }

    if (!['pacman', 'reaction'].includes(game)) {
      return res.status(400).json({ error: 'Invalid game' });
    }

    // Insert score
    const query = `
      INSERT INTO game_scores (player_id, nickname, game, score, difficulty)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await db.execute(query, [
      player_id, 
      nickname, 
      game, 
      score, 
      difficulty || null
    ]);

    res.status(201).json({ message: 'Score submitted successfully' });
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

// Get leaderboard for a game
router.get('/:game', async (req, res) => {
  try {
    const { game } = req.params;
    
    if (!['pacman', 'reaction'].includes(game)) {
      return res.status(400).json({ error: 'Invalid game' });
    }

    // Reaction time: lowest score is best (ASC), Pac-Man: highest is best (DESC)
    const orderBy = game === 'reaction' ? 'ASC' : 'DESC';

    // Get top 50 unique names for this game
    // We use GROUP BY nickname to get only the best score per name across all modes
    const query = `
      SELECT MAX(player_id) as player_id, nickname, game,
             ${game === 'reaction' ? 'MIN(score)' : 'MAX(score)'} as best_score
      FROM game_scores
      WHERE game = ?
      GROUP BY nickname
      ORDER BY best_score ${orderBy}
      LIMIT 50
    `;

    const [rows] = await db.execute(query, [game]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
