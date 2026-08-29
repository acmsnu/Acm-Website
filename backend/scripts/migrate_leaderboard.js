require('dotenv').config();
const db = require('../src/config/db');

async function migrate() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS game_scores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        player_id VARCHAR(36) NOT NULL,
        nickname VARCHAR(20) NOT NULL,
        game ENUM('pacman', 'reaction') NOT NULL,
        score INT NOT NULL,
        difficulty VARCHAR(10) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_game_score (game, score DESC),
        INDEX idx_player (player_id)
      )
    `;
    await db.query(query);
    console.log("Table game_scores created successfully");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit();
  }
}

migrate();
