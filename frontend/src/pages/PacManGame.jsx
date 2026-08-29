'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';


// Game constants
const CELL_SIZE = 20
const BOARD_WIDTH = 19
const BOARD_HEIGHT = 21
const CANVAS_WIDTH = BOARD_WIDTH * CELL_SIZE
const CANVAS_HEIGHT = BOARD_HEIGHT * CELL_SIZE
const INITIAL_GAME_SPEED = 15 // Slowed down from 6 to 12 frames per move for human reaction times
const MIN_GAME_SPEED = 2 // Minimum speed (move every 2 frames - faster)
const SPEED_INCREASE_INTERVAL = 1000 // Increase speed every 1000 points (slower progression)
// GHOST_SPEED is now calculated dynamically based on Pac-Man's speed
const MOUTH_ANIMATION_SPEED = 12 // Mouth animation every 12 frames (slower than movement)

// Game board layout (0 = empty, 1 = wall, 2 = dot, 3 = power pellet, 4 = pacman start, 5 = ghost start)
const BOARD_LAYOUT = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,3,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1,3,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1],
  [1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1],
  [1,1,1,1,1,2,1,1,1,0,1,1,1,2,1,1,1,1,1],
  [0,0,0,0,1,2,1,0,0,0,0,0,1,2,1,0,0,0,0],
  [1,1,1,1,1,2,1,0,1,1,1,0,1,2,1,1,1,1,1],
  [0,0,0,0,0,2,0,0,0,5,0,0,0,2,0,0,0,0,0],
  [1,1,1,1,1,2,1,0,1,1,1,0,1,2,1,1,1,1,1],
  [0,0,0,0,1,2,1,0,0,0,0,0,1,2,1,0,0,0,0],
  [1,1,1,1,1,2,1,1,1,0,1,1,1,2,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,1,1,1,1,1,1,2,1,1,1,2,1],
  [1,3,2,2,1,2,2,2,2,2,2,2,2,2,1,2,2,3,1],
  [1,1,1,2,1,2,1,2,1,1,1,2,1,2,1,2,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,2,1], // row 18 - fake walls [15][16] lead to portal at [16]
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
]

// Hidden level board layout - challenging maze with sword pellet, breakable wall, and power pellets
const HIDDEN_LEVEL_LAYOUT = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,2,2,2,1,2,2,2,2,2,2,2,2,2,1,2,2,2,1],
  [1,2,1,2,1,2,1,1,1,2,1,1,1,2,1,2,1,2,1],
  [1,2,1,2,2,2,2,2,1,2,1,2,2,2,2,2,1,2,1],
  [1,2,1,1,1,1,1,2,1,2,1,2,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1],
  [1,1,1,1,1,2,1,1,1,0,1,1,1,2,1,1,1,1,1],
  [0,0,0,0,1,2,0,0,0,0,0,0,0,2,1,0,0,0,0],
  [1,1,1,2,1,2,1,1,1,0,1,1,1,2,1,2,1,1,1],
  [0,0,1,2,2,2,1,2,2,2,2,2,1,2,2,2,1,0,0],
  [1,2,1,1,1,2,1,2,1,1,1,2,1,2,1,1,1,2,1],
  [1,2,2,2,1,2,2,2,1,2,1,2,2,2,1,2,2,2,1],
  [1,1,1,2,1,1,1,2,1,2,1,2,1,1,1,2,1,1,1],
  [1,2,2,2,2,2,1,2,2,2,2,2,1,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,1,1,2,1,1,1,2,1,1,1,2,1],
  [1,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,1],
  [1,2,1,2,1,1,1,1,3,2,1,1,1,1,1,2,1,2,1], // Sword pellet at (8,16)
  [1,2,2,2,1,2,2,2,2,2,2,2,2,2,1,2,2,2,1],
  [1,1,1,1,1,1,1,1,8,1,1,1,1,1,1,1,1,1,1], // Breakable wall at (8,18)
  [1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1], // Power pellets at (1,19) and (17,19)
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
]

// Special items for hidden level (6 = sword, 7 = boss spawn point)
const HIDDEN_LEVEL_ITEMS = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0], // Sword at (8,16)
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0], // Boss spawn at (7,19)
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
]

// Types




const PacManGame = () => {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [level, setLevel] = useState(1)
  const [showLevelTransition, setShowLevelTransition] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [deathEffect, setDeathEffect] = useState(false)
  const [pacmanDead, setPacmanDead] = useState(false)
  const [mouthOpen, setMouthOpen] = useState(true)
  const [deathAnimation, setDeathAnimation] = useState(false)
  const [hiddenLevelUnlocked, setHiddenLevelUnlocked] = useState(false)
  const [showUnlockPopup, setShowUnlockPopup] = useState(false)
  const [isHiddenLevel, setIsHiddenLevel] = useState(false)
  const [hasSword, setHasSword] = useState(false)
  const [bossActive, setBossActive] = useState(false)
  const [bossDefeated, setBossDefeated] = useState(false)
  const [bossHP, setBossHP] = useState(3)
  const [bossRegenTimer, setBossRegenTimer] = useState(0)
  const [testModeEnabled, setTestModeEnabled] = useState(false)
  const [bossParticles, setBossParticles] = useState([])
  const [hitEffects, setHitEffects] = useState([])
  const [deadGhosts, setDeadGhosts] = useState([])
  const [showPortalEffect, setShowPortalEffect] = useState(false)
  const [username, setUsername] = useState('')
  const [gameCount, setGameCount] = useState(0)

  // Game state
  const pacmanRef = useRef({ x: 9, y: 15 })
  const directionRef = useRef(0) // 0: right, 1: down, 2: left, 3: up
  const nextDirectionRef = useRef(0)
  const boardRef = useRef(JSON.parse(JSON.stringify(BOARD_LAYOUT)))
  const ghostsRef = useRef([
    { x: 9, y: 9, direction: 0, color: '#FF0000' },
    { x: 8, y: 9, direction: 1, color: '#FFB8FF' },
    { x: 10, y: 9, direction: 2, color: '#00FFFF' },
    { x: 9, y: 10, direction: 3, color: '#FFB852' }
  ])
  const bossRef = useRef({ x: 9, y: 19 })
  const animationRef = useRef(undefined)
  const frameCountRef = useRef(0)

  // Get or create player_id
  const getPlayerId = () => {
    let id = localStorage.getItem('acm_player_id')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('acm_player_id', id)
    }
    return id
  }

  // Submit score to backend
  const submitScore = useCallback(async (finalScore) => {
    try {
      const playerId = getPlayerId()
      const name = username.trim() || 'warrior'
      console.log('Submitting score:', finalScore, 'for', name)
      
      await fetch(`${API_BASE_URL}/leaderboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: playerId,
          nickname: name,
          game: 'pacman',
          score: finalScore
        })
      })
    } catch (error) {
      console.error('Failed to submit score:', error)
    }
  }, [username])

  // Draw game board
  const drawBoard = useCallback((ctx) => {
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cell = boardRef.current[y][x]
        if (cell === 1) {
          // Wall
          ctx.fillStyle = '#0000FF'
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        } else if (cell === 2) {
          // Dot - don't draw if Pac-Man is on this cell during death animation
          if (!(deathAnimation && x === pacmanRef.current.x && y === pacmanRef.current.y)) {
            ctx.fillStyle = '#FFFF00'
            ctx.beginPath()
            ctx.arc(x * CELL_SIZE + CELL_SIZE/2, y * CELL_SIZE + CELL_SIZE/2, 2, 0, 2 * Math.PI)
            ctx.fill()
          }
        } else if (cell === 3) {
          // Power pellet - don't draw if Pac-Man is on this cell during death animation
          if (!(deathAnimation && x === pacmanRef.current.x && y === pacmanRef.current.y)) {
            ctx.fillStyle = '#FFFF00'
            ctx.beginPath()
            ctx.arc(x * CELL_SIZE + CELL_SIZE/2, y * CELL_SIZE + CELL_SIZE/2, 5, 0, 2 * Math.PI)
            ctx.fill()
          }
        } else if (cell === 8) {
          // Breakable wall in hidden level - show as special colored wall
          ctx.fillStyle = '#8B4513' // Brown color for breakable wall
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
          // Add a highlight to show it's breakable
          ctx.fillStyle = '#D2691E'
          ctx.fillRect(x * CELL_SIZE + 2, y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4)
          // Add a crack pattern
          ctx.strokeStyle = '#654321'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(x * CELL_SIZE + 5, y * CELL_SIZE + 5)
          ctx.lineTo(x * CELL_SIZE + CELL_SIZE - 5, y * CELL_SIZE + CELL_SIZE - 5)
          ctx.moveTo(x * CELL_SIZE + CELL_SIZE - 5, y * CELL_SIZE + 5)
          ctx.lineTo(x * CELL_SIZE + 5, y * CELL_SIZE + CELL_SIZE - 5)
          ctx.stroke()
        }
      }




    }

    // Draw special items for hidden level
    if (isHiddenLevel) {
      // Draw sword if not collected
      if (!hasSword) {
        const swordY = 16
        const swordX = 8
        if (HIDDEN_LEVEL_ITEMS[swordY][swordX] === 6) {
          console.log(`🎨 Drawing sword at (${swordX}, ${swordY})`)
          const swordCenterX = swordX * CELL_SIZE + CELL_SIZE/2
          const swordCenterY = swordY * CELL_SIZE + CELL_SIZE/2

          // Draw shadow trail effect
          for (let i = 1; i <= 3; i++) {
            const alpha = 0.1 * (4 - i)
            ctx.fillStyle = `rgba(192, 192, 192, ${alpha})`
            ctx.fillRect(swordCenterX - 4 - i, swordCenterY - 8 - i, 8, 16)
          }

          // Draw glow effect
          ctx.shadowColor = '#FFD700'
          ctx.shadowBlur = 10
          ctx.fillStyle = '#FFD700' // Golden glow
          ctx.fillRect(swordCenterX - 5, swordCenterY - 9, 10, 18)
          ctx.shadowBlur = 0

          // Draw main sword
          ctx.fillStyle = '#C0C0C0' // Silver color
          ctx.fillRect(swordCenterX - 4, swordCenterY - 8, 8, 16)

          // Sword hilt with enhanced details
          ctx.fillStyle = '#654321' // Darker brown
          ctx.fillRect(swordCenterX - 2, swordCenterY + 8, 4, 6)

          // Hilt decorations
          ctx.fillStyle = '#FFD700' // Gold accents
          ctx.fillRect(swordCenterX - 1, swordCenterY + 9, 2, 1)
          ctx.fillRect(swordCenterX - 1, swordCenterY + 12, 2, 1)

          // Keyboard keys on blade with better visibility
          ctx.fillStyle = '#000000'
          ctx.fillRect(swordCenterX - 3, swordCenterY - 6, 2, 2) // W
          ctx.fillRect(swordCenterX + 1, swordCenterY - 6, 2, 2) // A
          ctx.fillRect(swordCenterX - 3, swordCenterY - 2, 2, 2) // S
          ctx.fillRect(swordCenterX + 1, swordCenterY - 2, 2, 2) // D

          // Add some sparkle effects
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(swordCenterX - 2, swordCenterY - 7, 1, 1)
          ctx.fillRect(swordCenterX + 2, swordCenterY + 7, 1, 1)
        }
      }

      // Draw boss if active and not defeated
      if (bossActive && !bossDefeated) {
        const boss = bossRef.current
        const bossX = boss.x * CELL_SIZE
        const bossY = boss.y * CELL_SIZE

        // Draw large boss monster
        ctx.fillStyle = '#8B0000' // Dark red
        ctx.fillRect(bossX + 2, bossY + 2, CELL_SIZE - 4, CELL_SIZE - 4)

        // Boss details - spikes/horns
        ctx.fillStyle = '#FF0000'
        ctx.fillRect(bossX, bossY, 4, 4) // Top left horn
        ctx.fillRect(bossX + CELL_SIZE - 4, bossY, 4, 4) // Top right horn
        ctx.fillRect(bossX, bossY + CELL_SIZE - 4, 4, 4) // Bottom left spike
        ctx.fillRect(bossX + CELL_SIZE - 4, bossY + CELL_SIZE - 4, 4, 4) // Bottom right spike

        // Boss eyes
        ctx.fillStyle = '#FFFF00'
        ctx.beginPath()
        ctx.arc(bossX + 6, bossY + 6, 3, 0, 2 * Math.PI)
        ctx.arc(bossX + CELL_SIZE - 6, bossY + 6, 3, 0, 2 * Math.PI)
        ctx.fill()

        // Angry eyebrows
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(bossX + 3, bossY + 3)
        ctx.lineTo(bossX + 9, bossY + 3)
        ctx.moveTo(bossX + CELL_SIZE - 9, bossY + 3)
        ctx.lineTo(bossX + CELL_SIZE - 3, bossY + 3)
        ctx.stroke()
      }

      // Draw boss particles
      bossParticles.forEach(particle => {
        if (particle.active) {
          ctx.fillStyle = '#FF0000' // Red particles
          ctx.beginPath()
          ctx.arc(
            particle.x * CELL_SIZE + CELL_SIZE/2,
            particle.y * CELL_SIZE + CELL_SIZE/2,
            3, // Small particle size
            0,
            2 * Math.PI
          )
          ctx.fill()
        }
      })

      // Draw hit effects
      hitEffects.forEach(effect => {
        if (effect.timer > 0) {
          const alpha = effect.timer / 30 // Fade out over time
          const effectSize = 20 + (30 - effect.timer) * 2 // Grow effect

          if (effect.type === 'sword') {
            // Sword collection effect - golden sparkles
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`
            for (let i = 0; i < 5; i++) {
              const angle = (i / 5) * 2 * Math.PI
              const distance = effectSize * 0.5
              const sparkleX = effect.x * CELL_SIZE + CELL_SIZE/2 + Math.cos(angle) * distance
              const sparkleY = effect.y * CELL_SIZE + CELL_SIZE/2 + Math.sin(angle) * distance
              ctx.beginPath()
              ctx.arc(sparkleX, sparkleY, 2, 0, 2 * Math.PI)
              ctx.fill()
            }
          } else if (effect.type === 'boss') {
            // Boss hit effect - red explosion
            ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`
            ctx.beginPath()
            ctx.arc(
              effect.x * CELL_SIZE + CELL_SIZE/2,
              effect.y * CELL_SIZE + CELL_SIZE/2,
              effectSize,
              0,
              2 * Math.PI
            )
            ctx.fill()

            // Inner white flash
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`
            ctx.beginPath()
            ctx.arc(
              effect.x * CELL_SIZE + CELL_SIZE/2,
              effect.y * CELL_SIZE + CELL_SIZE/2,
              effectSize * 0.5,
              0,
              2 * Math.PI
            )
            ctx.fill()
          }
        }
      })
    }


  }, [deathAnimation, isHiddenLevel, hasSword, bossActive, bossDefeated, bossParticles, hitEffects])

  // Draw Pac-Man
  const drawPacman = useCallback((ctx) => {
    const pacman = pacmanRef.current
    const dir = directionRef.current

    const centerX = pacman.x * CELL_SIZE + CELL_SIZE/2
    const centerY = pacman.y * CELL_SIZE + CELL_SIZE/2
    const radius = CELL_SIZE/2 - 2

    ctx.beginPath()

    // Draw Pac-Man based on direction and mouth state
    if (pacmanDead) {
      // Dead Pac-Man - just a circle (no mouth) in red
      ctx.fillStyle = '#FF0000'
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.fill()
    } else {
      // Calculate angles based on direction - mouth always opens in direction of movement
      const mouthAngle = mouthOpen ? Math.PI / 3 : Math.PI / 12 // 60 degrees open, 15 degrees closed

      let startAngle, endAngle

      switch (dir) {
        case 0: // right - mouth opens to the right
          startAngle = -mouthAngle / 2
          endAngle = mouthAngle / 2
          break
        case 1: // down - mouth opens downward
          startAngle = Math.PI / 2 - mouthAngle / 2
          endAngle = Math.PI / 2 + mouthAngle / 2
          break
        case 2: // left - mouth opens to the left
          startAngle = Math.PI - mouthAngle / 2
          endAngle = Math.PI + mouthAngle / 2
          break
        case 3: // up - mouth opens upward
          startAngle = 3 * Math.PI / 2 - mouthAngle / 2
          endAngle = 3 * Math.PI / 2 + mouthAngle / 2
          break
        default:
          startAngle = -mouthAngle / 2
          endAngle = mouthAngle / 2
      }

      // Draw the full yellow circle first
      ctx.fillStyle = '#FFFF00'
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
      ctx.fill()

      // Then draw the mouth cutout in black
      ctx.fillStyle = '#000000'
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, startAngle, endAngle, false)
      ctx.lineTo(centerX, centerY)
      ctx.fill()
    }
  }, [pacmanDead, mouthOpen])

  // Draw ghosts with enhanced details and shadows
  const drawGhosts = useCallback((ctx) => {
    ghostsRef.current.forEach((ghost, index) => {
      const x = ghost.x * CELL_SIZE
      const y = ghost.y * CELL_SIZE

      // Skip drawing dead ghosts
      const isDead = deadGhosts.some(dead => dead.index === index)
      if (isDead) return

      // Draw shadow trail effect (ghost-shaped, not rectangular)
      for (let i = 1; i <= 3; i++) {
        const alpha = 0.1 * (4 - i)
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})` // White shadows
        ctx.beginPath()

        // Offset shadow based on ghost's direction
        let shadowOffsetX = 0, shadowOffsetY = 0
        switch (ghost.direction) {
          case 0: shadowOffsetX = -i; break // right - shadow to left
          case 2: shadowOffsetX = i; break // left - shadow to right
          case 3: shadowOffsetY = i; break // up - shadow below
          case 1: shadowOffsetY = -i; break // down - shadow above
        }

        const shadowX = x + shadowOffsetX
        const shadowY = y + shadowOffsetY

        // Draw ghost-shaped shadow (same path as main body)
        ctx.arc(shadowX + CELL_SIZE/2, shadowY + CELL_SIZE/3, CELL_SIZE/3, Math.PI, 0, false)

        // Right side
        ctx.lineTo(shadowX + CELL_SIZE - 2, shadowY + 2)

        // Bottom wavy part with more waves
        const waveHeight = 3
        const waves = 5
        for (let wave = 0; wave < waves; wave++) {
          const waveX = shadowX + CELL_SIZE - 2 - (wave * (CELL_SIZE - 4) / (waves - 1))
          const waveY = shadowY + CELL_SIZE - 2 + (wave % 2 === 0 ? -waveHeight : waveHeight)
          ctx.lineTo(waveX, waveY)
        }

        // Left side
        ctx.lineTo(shadowX + 2, shadowY + CELL_SIZE - 2)

        ctx.closePath()
        ctx.fill()
      }

      // Main body
      ctx.fillStyle = deathEffect ? '#0000FF' : ghost.color
      ctx.beginPath()

      // Top rounded part
      ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/3, CELL_SIZE/3, Math.PI, 0, false)

      // Right side
      ctx.lineTo(x + CELL_SIZE - 2, y + 2)

      // Bottom wavy part with more waves
      const waveHeight = 3
      const waves = 5
      for (let i = 0; i < waves; i++) {
        const waveX = x + CELL_SIZE - 2 - (i * (CELL_SIZE - 4) / (waves - 1))
        const waveY = y + CELL_SIZE - 2 + (i % 2 === 0 ? -waveHeight : waveHeight)
        ctx.lineTo(waveX, waveY)
      }

      // Left side
      ctx.lineTo(x + 2, y + CELL_SIZE - 2)

      ctx.closePath()
      ctx.fill()

      // Body highlights/details
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.beginPath()
      ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/4, CELL_SIZE/6, 0, Math.PI, true)
      ctx.fill()

      // Eyes with direction-based pupils
      const eyeOffset = ghost.direction === 2 ? -0.5 : ghost.direction === 0 ? 0.5 : 0

      // Left eye
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.arc(x + CELL_SIZE/3 + eyeOffset, y + CELL_SIZE/3, 4, 0, 2 * Math.PI)
      ctx.fill()

      // Right eye
      ctx.beginPath()
      ctx.arc(x + 2*CELL_SIZE/3 + eyeOffset, y + CELL_SIZE/3, 4, 0, 2 * Math.PI)
      ctx.fill()

      // Pupils that look in movement direction
      ctx.fillStyle = '#000000'

      // Left pupil
      let pupilOffsetX = 0, pupilOffsetY = 0
      switch (ghost.direction) {
        case 0: pupilOffsetX = 1; break // right
        case 2: pupilOffsetX = -1; break // left
        case 3: pupilOffsetY = -1; break // up
        case 1: pupilOffsetY = 1; break // down
      }

      ctx.beginPath()
      ctx.arc(x + CELL_SIZE/3 + eyeOffset + pupilOffsetX, y + CELL_SIZE/3 + pupilOffsetY, 1.5, 0, 2 * Math.PI)
      ctx.fill()

      // Right pupil
      ctx.beginPath()
      ctx.arc(x + 2*CELL_SIZE/3 + eyeOffset + pupilOffsetX, y + CELL_SIZE/3 + pupilOffsetY, 1.5, 0, 2 * Math.PI)
      ctx.fill()

      // Eyebrows for expression
      ctx.strokeStyle = ghost.color
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x + CELL_SIZE/3 - 2, y + CELL_SIZE/4)
      ctx.lineTo(x + CELL_SIZE/3 + 2, y + CELL_SIZE/4)
      ctx.moveTo(x + 2*CELL_SIZE/3 - 2, y + CELL_SIZE/4)
      ctx.lineTo(x + 2*CELL_SIZE/3 + 2, y + CELL_SIZE/4)
      ctx.stroke()

      // Optional: Add some pattern/details based on ghost type
      if (index === 0) { // Red ghost - add some dots
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, 1, 0, 2 * Math.PI)
        ctx.fill()
      } else if (index === 1) { // Pink ghost - add some lines
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x + CELL_SIZE/4, y + CELL_SIZE/2)
        ctx.lineTo(x + 3*CELL_SIZE/4, y + CELL_SIZE/2)
        ctx.stroke()
      }
    })
  }, [deathEffect, deadGhosts])

  // Check collision with wall
  const isWall = (x, y) => {
    if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) {
      return true // Treat out of bounds as wall
    }
    const cell = boardRef.current[y][x]
    return cell === 1 || (cell === 8 && !hasSword) // Breakable wall only blocks without sword
  }

  // Move Pac-Man
  const movePacman = useCallback(() => {
    const pacman = pacmanRef.current
    let newX = pacman.x
    let newY = pacman.y

    // Try next direction first
    if (nextDirectionRef.current === 0 && !isWall(pacman.x + 1, pacman.y)) { // right
      newX = pacman.x + 1
      directionRef.current = 0
    } else if (nextDirectionRef.current === 1 && !isWall(pacman.x, pacman.y + 1)) { // down
      newY = pacman.y + 1
      directionRef.current = 1
    } else if (nextDirectionRef.current === 2 && !isWall(pacman.x - 1, pacman.y)) { // left
      newX = pacman.x - 1
      directionRef.current = 2
    } else if (nextDirectionRef.current === 3 && !isWall(pacman.x, pacman.y - 1)) { // up
      newY = pacman.y - 1
      directionRef.current = 3
    } else {
      // Continue in current direction
      if (directionRef.current === 0 && !isWall(pacman.x + 1, pacman.y)) newX = pacman.x + 1
      else if (directionRef.current === 1 && !isWall(pacman.x, pacman.y + 1)) newY = pacman.y + 1
      else if (directionRef.current === 2 && !isWall(pacman.x - 1, pacman.y)) newX = pacman.x - 1
      else if (directionRef.current === 3 && !isWall(pacman.x, pacman.y - 1)) newY = pacman.y - 1
    }

    if (newX !== pacman.x || newY !== pacman.y) {
      pacman.x = newX
      pacman.y = newY

      // Eat dot
      if (boardRef.current[newY][newX] === 2) {
        boardRef.current[newY][newX] = 0
        setScore(prev => prev + 10)
      }
      // Eat power pellet
      else if (boardRef.current[newY][newX] === 3) {
        boardRef.current[newY][newX] = 0
        setScore(s => s + 50)
        setPowerMode(true)
        setPowerTimer(Math.max(60, 300 - ((level - 1) * 60))) // Scale down duration by 1s per level
        setHitEffects(prev => [...prev, { x: pacman.x, y: pacman.y, text: 'POWER!' }])

        // Check if this is the sword pellet in hidden level
        if (isHiddenLevel && !hasSword && newX === 8 && newY === 16) {
          console.log(`⚔️ Sword pellet collected at (${newX}, ${newY})!`)
          setHasSword(true)
          setScore(prev => prev + 150) // Bonus for collecting sword pellet

          // Add sword collection hit effect
          setHitEffects(prev => [...prev, {
            x: newX,
            y: newY,
            type: 'sword',
            timer: 30 // 30 frames = 0.5 seconds
          }])
        }
      }

      // Debug: Log Pac-Man position in hidden level (less frequently for performance)
      if (isHiddenLevel && frameCountRef.current % 120 === 0) {
        console.log(`🎮 Pac-Man at (${newX}, ${newY}), Sword pellet at (8,16), Has sword: ${hasSword}`)
      }

      // Check for boss collision in hidden level
      if (isHiddenLevel && bossActive && !bossDefeated) {
        const boss = bossRef.current
        if (newX === boss.x && newY === boss.y) {
          if (hasSword) {
            // Hit the boss with sword - reduce HP and teleport boss to safe location
            // Add boss hit effect
            setHitEffects(prev => [...prev, {
              x: boss.x,
              y: boss.y,
              type: 'boss',
              timer: 20 // 20 frames = ~0.33 seconds
            }])

            setBossHP(prev => {
              const newHP = prev - 1
              if (newHP <= 0) {
                // Boss defeated!
                setBossDefeated(true)
                setScore(prevScore => prevScore + 500) // Big bonus for defeating boss
                // Win the hidden level
                setGameWon(true)
                setIsPlaying(false)
                submitScore(score + 500)
              } else {
                // Boss takes damage but survives - teleport to safe location
                console.log(`Boss hit! HP: ${newHP}/3 - Teleporting to safe location`)

                // Teleport boss to one of several safe locations
                const safeLocations = [
                  { x: 1, y: 1 },   // Top-left corner
                  { x: 17, y: 1 },  // Top-right corner
                  { x: 1, y: 19 },  // Bottom-left corner
                  { x: 17, y: 19 }, // Bottom-right corner
                  { x: 9, y: 10 },  // Center area
                  { x: 5, y: 5 },   // Upper left area
                  { x: 13, y: 5 },  // Upper right area
                  { x: 5, y: 15 },  // Lower left area
                  { x: 13, y: 15 }  // Lower right area
                ]

                // Choose random safe location
                const safeLocation = safeLocations[Math.floor(Math.random() * safeLocations.length)]
                bossRef.current = { x: safeLocation.x, y: safeLocation.y }
                console.log(`Boss teleported to (${safeLocation.x}, ${safeLocation.y})`)

                setScore(prevScore => prevScore + 50) // Small bonus for hitting boss
              }
              return newHP
            })
          } else {
            // Can't defeat boss without sword - take damage
            setDeathAnimation(true)
            setPacmanDead(true)
            setDeathEffect(true)
            setLives(prev => {
              const newLives = prev - 1
              if (newLives <= 0) {
                setGameOver(true)
                setIsPlaying(false)
                submitScore(score)
              }
              return newLives
            })
          }
        }
      }

      // Check for hidden portal discovery (regular level only) - requires both touch AND score >= 1500
      if (!isHiddenLevel && !gameWon && score >= 1500) {
        // Check if Pac-Man is on the hidden portal location (bottom-right corner area)
        const portalX = 16
        const portalY = 18

        if (pacman.x === portalX && pacman.y === portalY) {
          console.log('🌟 Hidden portal discovered with sufficient score! Showing unlock popup...')
          setShowPortalEffect(true)

          // Add portal effect
          setHitEffects(prev => [...prev, {
            x: portalX,
            y: portalY,
            type: 'portal',
            timer: 60 // 60 frames = 1 second
          }])

          // Show unlock popup instead of immediately teleporting
          setTimeout(() => {
            setShowUnlockPopup(true)
            setShowPortalEffect(false)
            console.log('🎉 Portal discovered! Hidden level unlock popup shown!')
          }, 1000)
        }

        // Check for level completion (regular level only)
        let remainingDots = 0
        for (let y = 0; y < BOARD_HEIGHT; y++) {
          for (let x = 0; x < BOARD_WIDTH; x++) {
            if (boardRef.current[y][x] === 2 || boardRef.current[y][x] === 3) {
              remainingDots++
            }
          }
        }

        // If all dots and pellets are collected, win the level (but don't unlock hidden level)
        if (remainingDots === 0) {
          console.log(`🎉 Level ${level} completed!`)
          setLevel(prev => prev + 1)
          setIsPlaying(false)
          setShowLevelTransition(true)
          
          setTimeout(() => {
            setShowLevelTransition(false)
            startGame(false, true) // Restart board, preserve score and lives
          }, 2000)
        }
      }
    }

    // Wrap around
    if (pacman.x < 0) pacman.x = BOARD_WIDTH - 1
    if (pacman.x >= BOARD_WIDTH) pacman.x = 0
  }, [isHiddenLevel, hasSword, bossActive, bossDefeated, score, submitScore, level])

  // Move ghosts (simple AI) - planned chase behavior with some unpredictability
  const moveGhosts = useCallback(() => {
    const pacman = pacmanRef.current

    ghostsRef.current.forEach((ghost, index) => {
      const directions = [
        { x: 1, y: 0 }, // right
        { x: 0, y: 1 }, // down
        { x: -1, y: 0 }, // left
        { x: 0, y: -1 } // up
      ]

      // Different ghosts have different behavior tendencies - no chasing from beginning
      const patternFactor = [0.6, 0.5, 0.7, 0.4][index] // Higher = more likely to continue in pattern
      const randomFactor = [0.4, 0.5, 0.3, 0.6][index] // Lower = more predictable

      let chosenDirection = null

      // Decide movement strategy - focus on patterns and randomness, not chasing
      const rand = Math.random()

      if (rand < patternFactor) {
        // Continue in current direction (patterned movement)
        const currentDir = directions[ghost.direction]
        const newX = ghost.x + currentDir.x
        const newY = ghost.y + currentDir.y

        if (!isWall(newX, newY)) {
          chosenDirection = { dir: currentDir, index: ghost.direction }
        }
      } else if (rand < patternFactor + randomFactor) {
        // Turn at intersections or randomly change direction
        const validDirections = directions.map((dir, dirIndex) => ({
          dir: dir,
          index: dirIndex
        })).filter(({ dir }) => {
          const checkX = ghost.x + dir.x
          const checkY = ghost.y + dir.y
          return !isWall(checkX, checkY)
        })

        if (validDirections.length > 0) {
          // Prefer directions that are not opposite to current direction (avoid immediate reversals)
          const oppositeDir = (ghost.direction + 2) % 4
          const goodDirections = validDirections.filter(d => d.index !== oppositeDir)

          if (goodDirections.length > 0) {
            chosenDirection = goodDirections[Math.floor(Math.random() * goodDirections.length)]
          } else {
            chosenDirection = validDirections[Math.floor(Math.random() * validDirections.length)]
          }
        }
      } else {
        // Occasionally scatter to different areas
        const validDirections = directions.map((dir, dirIndex) => ({
          dir: dir,
          index: dirIndex
        })).filter(({ dir }) => {
          const checkX = ghost.x + dir.x
          const checkY = ghost.y + dir.y
          return !isWall(checkX, checkY)
        })

        if (validDirections.length > 0) {
          chosenDirection = validDirections[Math.floor(Math.random() * validDirections.length)]
        }
      }

      // Execute chosen movement
      if (chosenDirection) {
        ghost.x += chosenDirection.dir.x
        ghost.y += chosenDirection.dir.y
        ghost.direction = chosenDirection.index
      } else {
        // Fallback: try any valid direction
        let validDirections = directions.filter(dir => {
          const checkX = ghost.x + dir.x
          const checkY = ghost.y + dir.y
          return !isWall(checkX, checkY)
        })

        if (validDirections.length > 0) {
          const randomDir = validDirections[Math.floor(Math.random() * validDirections.length)]
          ghost.x += randomDir.x
          ghost.y += randomDir.y
          ghost.direction = directions.indexOf(randomDir)
        }
      }
    })
  }, [])

  // Check collisions
  const checkCollisions = useCallback(() => {
    const pacman = pacmanRef.current

    // Check ghost collisions
    ghostsRef.current.forEach((ghost, index) => {
      // Skip dead ghosts (only applies to hidden level)
      if (isHiddenLevel) {
        const isDead = deadGhosts.some(dead => dead.index === index)
        if (isDead) return
      }

      // Check for collision - use exact position matching
      if (ghost.x === pacman.x && ghost.y === pacman.y && !deathAnimation) {
        console.log(`👻 Collision detected! Ghost ${index} at (${ghost.x},${ghost.y}), Pac-Man at (${pacman.x},${pacman.y})`)

        if (isHiddenLevel && hasSword) {
          // Kill the ghost with sword (hidden level only)
          console.log(`⚔️ Ghost ${index} defeated by sword!`)
          setDeadGhosts(prev => [...prev, {
            index: index,
            respawnTime: frameCountRef.current + 900 // 15 seconds = 900 frames at 60fps
          }])
          setScore(prevScore => prevScore + 200) // Bonus for killing ghost
        } else {
          // Normal ghost collision - lose life (both regular and hidden level without sword)
          console.log('💀 Normal level ghost collision - triggering death!')
          setDeathAnimation(true)
          setPacmanDead(true)
          setDeathEffect(true)

          setLives(prev => {
            const newLives = prev - 1
            console.log(`Lives remaining: ${newLives}`)
            if (newLives <= 0) {
              setGameOver(true)
              setIsPlaying(false)
              submitScore(score)
            }
            return newLives
          })
        }
      }
    })

    // Hidden level win condition: boss defeat (not dot collection)
    if (isHiddenLevel && bossDefeated) {
      console.log('🏆 Hidden level completed! Boss defeated!')

      setGameWon(true)
      setIsPlaying(false)
      submitScore(score)

      console.log('🎉 Hidden level victory!')
    }
  }, [score, submitScore, deathAnimation, isHiddenLevel, hasSword, deadGhosts])

  // Handle death animation
  const updateDeathAnimation = useCallback(() => {
    if (!deathAnimation) return

    const pacman = pacmanRef.current
    const spawnX = 9
    const spawnY = 15

    // Move Pac-Man towards spawn point
    if (pacman.x < spawnX) pacman.x++
    else if (pacman.x > spawnX) pacman.x--
    else if (pacman.y < spawnY) pacman.y++
    else if (pacman.y > spawnY) pacman.y--
    else {
      // Reached spawn point, end death animation
      setDeathAnimation(false)
      setPacmanDead(false)
      setDeathEffect(false)
      directionRef.current = 0
      nextDirectionRef.current = 0
      ghostsRef.current = [
        { x: 9, y: 9, direction: 0, color: '#FF0000' },
        { x: 8, y: 9, direction: 1, color: '#FFB8FF' },
        { x: 10, y: 9, direction: 2, color: '#00FFFF' },
        { x: 9, y: 10, direction: 3, color: '#FFB852' }
      ]
    }
  }, [deathAnimation])

  // Move boss and handle particle attacks
  const moveBoss = useCallback(() => {
    if (!bossActive || bossDefeated) return

    const boss = bossRef.current
    const directions = [
      { x: 1, y: 0 }, // right
      { x: 0, y: 1 }, // down
      { x: -1, y: 0 }, // left
      { x: 0, y: -1 } // up
    ]

    // Boss moves slower and more predictably
    const rand = Math.random()
    if (rand < 0.8) {
      // Continue in current direction if possible
      const currentDir = directions[Math.floor(Math.random() * 4)] // Random direction
      const newX = boss.x + currentDir.x
      const newY = boss.y + currentDir.y

      if (!isWall(newX, newY) && newX >= 0 && newX < BOARD_WIDTH && newY >= 0 && newY < BOARD_HEIGHT) {
        boss.x = newX
        boss.y = newY
      }
    }

    // Boss attacks every 5 seconds (300 frames at 60fps)
    if (frameCountRef.current % 300 === 0) {
      // Spawn 8 particles in circular pattern
      const particles = []
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * 2 * Math.PI
        const speed = 0.5 // Particle movement speed
        particles.push({
          x: boss.x,
          y: boss.y,
          dx: Math.cos(angle) * speed,
          dy: Math.sin(angle) * speed,
          active: true
        })
      }
      setBossParticles(particles)
    }
  }, [bossActive, bossDefeated])

  // Update boss particles
  const updateBossParticles = useCallback(() => {
    setBossParticles(prevParticles => {
      const pacman = pacmanRef.current
      return prevParticles.map(particle => {
        if (!particle.active) return particle

        // Move particle
        const newX = particle.x + particle.dx
        const newY = particle.y + particle.dy

        // Particles can pass through walls - no wall collision check

        // Check Pac-Man collision
        if (Math.floor(newX) === pacman.x && Math.floor(newY) === pacman.y && !deathAnimation) {
          console.log('💥 Particle hit! Lost 1 life.')
          // Hit Pac-Man - reduce life
          setLives(prev => {
            const newLives = prev - 1
            if (newLives <= 0) {
              setGameOver(true)
              setIsPlaying(false)
              submitScore(score)
            }
            return newLives
          })
          return { ...particle, active: false }
        }

        return {
          ...particle,
          x: newX,
          y: newY
        }
      }).filter(particle => particle.active || Math.random() > 0.1) // Gradually remove inactive particles
    })
  }, [deathAnimation, score, submitScore])

  // Game loop
  const gameLoop = useCallback(() => {
    if (!isPlaying) return

    // Only move every GAME_SPEED frames for slower gameplay
    frameCountRef.current++

    // Calculate current game speed based on score (gradually increases)
    const currentGameSpeed = Math.max(MIN_GAME_SPEED, INITIAL_GAME_SPEED - Math.floor(score / SPEED_INCREASE_INTERVAL))

    if (deathAnimation) {
      // Handle death animation movement
      if (frameCountRef.current % currentGameSpeed === 0) {
        updateDeathAnimation()
      }
    } else {
      // Normal gameplay - Pac-Man moves based on current speed
      if (frameCountRef.current % currentGameSpeed === 0) {
        movePacman()
      }

      // Ghosts move at different speeds based on level (slightly slower than Pac-Man normally, faster in hidden level)
      const currentGhostSpeed = isHiddenLevel ? Math.max(2, currentGameSpeed - 2) : currentGameSpeed + 2
      if (frameCountRef.current % currentGhostSpeed === 0) {
        moveGhosts()
        // Boss moves at same speed as ghosts in hidden level
        if (isHiddenLevel) {
          moveBoss()
        }
      }

      // Update boss particles every frame
      if (isHiddenLevel && bossActive) {
        updateBossParticles()
      }

      // Update hit effects
      setHitEffects(prev => prev.map(effect => ({
        ...effect,
        timer: effect.timer - 1
      })).filter(effect => effect.timer > 0))

      // Respawn dead ghosts after 15 seconds (900 frames)
      setDeadGhosts(prev => prev.filter(deadGhost => {
        if (frameCountRef.current >= deadGhost.respawnTime) {
          console.log(`👻 Ghost ${deadGhost.index} respawned!`)
          // Ghost is respawned, remove from dead list
          return false
        }
        return true
      }))

      // Boss regeneration - slowly regain HP over time (hidden level only)
      if (isHiddenLevel && bossActive && !bossDefeated && bossHP < 3) {
        setBossRegenTimer(prev => {
          const newTimer = prev + 1
          // Regenerate 1 HP every 20 seconds (1200 frames at 60fps) - slower regeneration
          if (newTimer >= 1200) {
            console.log('🩸 Boss regenerating 1 HP!')
            setBossHP(currentHP => Math.min(currentHP + 1, 3)) // Cap at 3 HP
            return 0 // Reset timer
          }
          return newTimer
        })
      }
    }

    // Animate Pac-Man's mouth at slower speed
    if (frameCountRef.current % MOUTH_ANIMATION_SPEED === 0 && !deathAnimation) {
      setMouthOpen(prev => !prev)
    }

    // Check collisions every frame for immediate detection (but not during death animation)
    if (!deathAnimation) {
      checkCollisions()
    }

    // Always draw for smooth rendering
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        drawBoard(ctx)
        drawPacman(ctx)
        drawGhosts(ctx)
        if (frameCountRef.current % 60 === 0) { // Debug log every second
          console.log('Game loop running, hidden level:', isHiddenLevel, 'playing:', isPlaying)
        }
      }
    }

    animationRef.current = requestAnimationFrame(gameLoop)
  }, [isPlaying, movePacman, moveGhosts, moveBoss, checkCollisions, drawBoard, drawPacman, drawGhosts, deathAnimation, updateDeathAnimation, isHiddenLevel, score, updateBossParticles, bossActive, bossHP, bossDefeated])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isPlaying) return

      switch (e.key.toLowerCase()) {
        case 'arrowright':
        case 'd':
          nextDirectionRef.current = 0
          break
        case 'arrowdown':
        case 's':
          nextDirectionRef.current = 1
          break
        case 'arrowleft':
        case 'a':
          nextDirectionRef.current = 2
          break
        case 'arrowup':
        case 'w':
          nextDirectionRef.current = 3
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isPlaying])

  // Load game count from localStorage and set up console commands
  useEffect(() => {
    // Load game count from localStorage
    const savedGameCount = localStorage.getItem('pacmanGameCount')
    if (savedGameCount) {
      const count = parseInt(savedGameCount, 10)
      setGameCount(count)
      console.log('Loaded game count from localStorage:', count)
    }

    // Add global function for testing
    const globalWindow = window;
    globalWindow.enableTestMode = () => {
      setTestModeEnabled(true)
      console.log('🎮 Test mode enabled! Use the test button to unlock hidden level.')
    }

    const originalLog = console.log
    console.log = (...args) => {
      originalLog.apply(console, args)

      // Check for the secret code
      if (args.join(' ').toLowerCase().includes('zanes world')) {
        setHiddenLevelUnlocked(true)
        console.log('🎮 Hidden level unlocked! You can now access the boss battle.')
      }
    }

    return () => {
      console.log = originalLog
      delete globalWindow.enableTestMode
    }
  }, [])

  // Set 80% score for testing
  const setTestScore = useCallback(() => {
    if (!testModeEnabled) return

    // Calculate 80% of maximum possible score
    let totalDots = 0
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (BOARD_LAYOUT[y][x] === 2 || BOARD_LAYOUT[y][x] === 3) {
          totalDots++
        }
      }
    }

    const targetScore = Math.floor((totalDots * 10) * 0.8) // 80% of max score
    setScore(targetScore)
    setHiddenLevelUnlocked(true)
    console.log(`🎯 Test score set to ${targetScore} (${Math.floor(targetScore / (totalDots * 10) * 100)}% of maximum)`)
  }, [testModeEnabled])

  // Start game
  const startGame = (useHiddenLevel = false, preserveScoreAndLives = false) => {
    console.log('Starting game, hidden level:', useHiddenLevel, 'preserve score/lives:', preserveScoreAndLives)

    // Increment game count (only for regular level starts)
    if (!useHiddenLevel && !preserveScoreAndLives) {
      const newGameCount = gameCount + 1
      setGameCount(newGameCount)
      localStorage.setItem('pacmanGameCount', newGameCount.toString())
      console.log('Game count incremented to:', newGameCount)
    }

    // Reset all game states first (but preserve score/lives if requested)
    if (!preserveScoreAndLives) {
      setScore(0)
      setLives(3)
      setLevel(1)
    }
    
    setGameOver(false)
    setGameWon(false)
    setDeathEffect(false)
    setPacmanDead(false)
    setDeathAnimation(false)
    setHasSword(false) // Sword must be collected in hidden level
    setBossActive(useHiddenLevel)
    setBossDefeated(false)
    setBossHP(3)
    setHitEffects([])
    setBossParticles([])
    setDeadGhosts([]) // Reset dead ghosts
    setBossRegenTimer(0) // Reset boss regeneration timer

    // Set playing and hidden level states
    setIsPlaying(true)
    setIsHiddenLevel(useHiddenLevel)

    console.log('States set: isPlaying=true, isHiddenLevel=', useHiddenLevel, 'score preserved:', preserveScoreAndLives)

    frameCountRef.current = 0

    // Choose board layout
    const layoutToUse = useHiddenLevel ? HIDDEN_LEVEL_LAYOUT : BOARD_LAYOUT
    boardRef.current = JSON.parse(JSON.stringify(layoutToUse))
    console.log('Board loaded, hidden level items:', HIDDEN_LEVEL_ITEMS)

    pacmanRef.current = { x: 9, y: 15 }
    directionRef.current = 0
    nextDirectionRef.current = 0
    bossRef.current = { x: 7, y: 19 } // Reset boss position to match spawn point in HIDDEN_LEVEL_ITEMS
    ghostsRef.current = [
      { x: 9, y: 9, direction: 0, color: '#FF0000' },
      { x: 8, y: 9, direction: 1, color: '#FFB8FF' },
      { x: 10, y: 9, direction: 2, color: '#00FFFF' },
      { x: 9, y: 10, direction: 3, color: '#FFB852' }
    ]
    console.log('Game initialized successfully, isPlaying should be true now')

    // Force a state check
    setTimeout(() => {
      console.log('After timeout - checking states: playing=', isPlaying, 'hidden=', isHiddenLevel)
    }, 50)

    // Focus the canvas for keyboard input
    setTimeout(() => {
      const canvas = canvasRef.current
      if (canvas) {
        canvas.focus()
        console.log('Canvas focused for input')
      }
    }, 100)
  }

  // Start game loop when playing
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(gameLoop)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, gameLoop])

  
  return (
    <div className="min-h-screen bg-[#0d071d] pt-24 pb-12 font-vt323 relative">
      <Link to="/games" className="absolute top-8 left-8 text-[#ff5ea6] hover:text-[#ff8cbe] flex items-center gap-2 font-vt323 text-2xl transition-colors">
        <ChevronLeft /> Back to Arcade
      </Link>
      <div className="flex flex-col items-center gap-4 p-4">
      {/* Username input */}
      {!isPlaying && (
        <div className="mb-4">
          <label className="text-white text-sm mb-2 block">Enter your name:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="warrior"
            className="px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            maxLength={20}
          />
        </div>
      )}

      <div className="flex gap-8 text-white">
        <div>Score: {score}</div>
        <div>Level: {level}</div>
        <div>Lives: {lives}</div>
      </div>



      {/* HP Bars for Hidden Level */}
      {isPlaying && isHiddenLevel && (
        <div className="flex gap-8 w-full max-w-md">
          {/* Player HP */}
          <div className="flex-1">
            <div className="text-white text-sm mb-1">Player HP</div>
            <div className="bg-gray-800 border border-gray-600 rounded p-2">
              <div className="bg-green-500 h-4 rounded" style={{ width: `${(lives / 3) * 100}%` }}></div>
              <div className="text-white text-xs mt-1">{lives}/3</div>
            </div>
          </div>

          {/* Boss HP */}
          {bossActive && !bossDefeated && (
            <div className="flex-1">
              <div className="text-white text-sm mb-1">Boss HP</div>
              <div className="bg-gray-800 border border-gray-600 rounded p-2">
                <div className="bg-red-500 h-4 rounded" style={{ width: `${(bossHP / 3) * 100}%` }}></div>
                <div className="text-white text-xs mt-1">{bossHP}/3</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Test button when test mode is enabled */}
      {testModeEnabled && !isPlaying && (
        <div className="mb-4">
          <button className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white font-bold rounded transition-colors" onClick={setTestScore}>
            🎯 Set 80% Score (Test)
          </button>
        </div>
      )}

      <div className="mt-4 mb-8 flex flex-col items-center w-full">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-blue-800 rounded-lg shadow-[0_0_20px_rgba(30,58,138,0.5)] w-[95%] max-w-[380px] md:max-w-[500px] lg:max-w-[570px] h-auto aspect-[380/420]"
          style={{ imageRendering: 'pixelated' }}
          tabIndex={0}
        />

        {!isPlaying && !gameOver && !gameWon && (
          <div className="flex gap-4 justify-center mt-6">
            <button className="px-8 py-3 bg-[#ff5ea6] hover:bg-[#ff8cbe] text-white font-vt323 text-3xl rounded transition-colors shadow-[0_0_15px_rgba(255,94,166,0.4)]" onClick={() => startGame(false)}>Start Game</button>
            {hiddenLevelUnlocked && (
              <button className="px-8 py-3 bg-[#a8a0ff] hover:bg-[#c4bfff] text-white font-vt323 text-3xl rounded transition-colors shadow-[0_0_15px_rgba(168,160,255,0.4)]" onClick={() => startGame(true)}>
                Hidden Level
              </button>
            )}
          </div>
        )}
      </div>

      {gameOver && (
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">Game Over!</div>
          <div className="text-white mb-4">Final Score: {score}</div>
          <button className="px-4 py-2 bg-[#ff5ea6] hover:bg-[#ff8cbe] text-white font-bold rounded transition-colors" onClick={() => startGame(false)}>Play Again</button>
        </div>
      )}

      {gameWon && (
        <div className="text-center">
          <div className="text-green-500 text-xl mb-2">You Won!</div>
          <div className="text-white mb-4">Final Score: {score}</div>
          <div className="flex gap-4 justify-center">
            <button className="px-4 py-2 bg-[#ff5ea6] hover:bg-[#ff8cbe] text-white font-bold rounded transition-colors" onClick={() => startGame(false)}>Play Again</button>
            {hiddenLevelUnlocked && (
              <button className="px-4 py-2 bg-[#a8a0ff] hover:bg-[#c4bfff] text-white font-bold rounded transition-colors" onClick={() => startGame(true)}>
                🗡️ Play Hidden Level
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hidden Level Unlock Popup */}
      {showUnlockPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 border-4 border-yellow-400 p-8 text-center pixel-font">
            <div className="text-yellow-400 text-2xl font-bold mb-4">
              🌟 SECRET PORTAL DISCOVERED! 🌟
            </div>
            <div className="text-white text-lg mb-2">
              &ldquo;You've found the hidden passage&rdquo;
            </div>
            <div className="text-white text-lg mb-4">
              &ldquo;a mysterious realm awaits the brave {username.trim() || 'warrior'}&rdquo;
            </div>
            <div className="text-yellow-300 text-sm mb-6">
              ⚔️ Enter at your own risk... ⚔️
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => { setShowUnlockPopup(false); startGame(true, true); }}
                className="px-6 py-3 bg-yellow-400 text-black font-bold border-2 border-yellow-400 hover:bg-yellow-300 hover:border-yellow-300 transition-colors pixel-font"
              >
                🌀 Enter the Unknown
              </button>
              <button
                onClick={() => { setShowUnlockPopup(false); startGame(false, true); }}
                className="px-6 py-3 bg-gray-700 text-yellow-400 font-bold border-2 border-yellow-400 hover:bg-gray-600 hover:border-yellow-300 transition-colors pixel-font"
              >
                Stay Safe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Level Transition Popup */}
      {showLevelTransition && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 border-4 border-[#ff5ea6] p-8 text-center pixel-font">
            <div className="text-[#ff5ea6] text-3xl font-bold mb-4">
              LEVEL CLEARED!
            </div>
            <div className="text-white text-xl">
              Get ready for Level {level}...
            </div>
          </div>
        </div>
      )}

      {/* Level indicator */}
      {isPlaying && isHiddenLevel && (
        <div className="text-center text-red-400 text-sm font-bold">
          ⚔️ HIDDEN LEVEL ⚔️
        </div>
      )}

      {isPlaying && (
        <div className="text-center text-white text-sm">
          Use arrow keys to move Pac-Man
        </div>
      )}
    </div>
    </div>
  )
}

export default PacManGame
