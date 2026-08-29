'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';





const DIFFICULTY_CONFIG = {
  easy: { min: 2000, max: 4000, label: 'Easy', color: '#10B981', multiplier: 1 },
  medium: { min: 1000, max: 3000, label: 'Medium', color: '#F59E0B', multiplier: 1.5 },
  hard: { min: 500, max: 2000, label: 'Hard', color: '#EF4444', multiplier: 2 }
}

const ReactionGame = () => {
  const [gameState, setGameState] = useState('idle')
  const [difficulty, setDifficulty] = useState('medium')
  const [reactionTime, setReactionTime] = useState(0)
  const [bestTime, setBestTime] = useState(null)
  const [round, setRound] = useState(1)
  const [roundTimes, setRoundTimes] = useState([])
  const [username, setUsername] = useState('')
  const [falseStart, setFalseStart] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [ripple, setRipple] = useState({
    active: false,
    color: 'green',
    key: 0
  })
  const [isMuted, setIsMuted] = useState(false)

  const startTimeRef = useRef(0)
  const timeoutRef = useRef(null)
  const isProcessingRef = useRef(false)
  const validSoundRef = useRef(null)
  const errorSoundRef = useRef(null)

  // Load username from localStorage
  useEffect(() => {
    const savedUsername = localStorage.getItem('reactionGame_username')
    if (savedUsername) {
      setUsername(savedUsername)
    }
  }, [])

  // Save username to localStorage
  const saveUsername = (name) => {
    setUsername(name)
    localStorage.setItem('reactionGame_username', name)
  }

  // Load best time from localStorage
  useEffect(() => {
    const savedBestTime = localStorage.getItem(`reactionGame_best_${difficulty}`)
    if (savedBestTime) {
      setBestTime(parseInt(savedBestTime))
    }
  }, [difficulty])

  // Get or create player_id
  const getPlayerId = () => {
    let id = localStorage.getItem('acm_player_id')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('acm_player_id', id)
    }
    return id
  }

  // Save score to leaderboard
  const saveScore = useCallback(async (time) => {
    let finalUsername = username.trim()
    if (!finalUsername) {
      finalUsername = `Player${Math.floor(Math.random() * 1000)}`
      saveUsername(finalUsername)
    }

    try {
      const playerId = getPlayerId()
      
      await fetch(`${API_BASE_URL}/leaderboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: playerId,
          nickname: finalUsername,
          game: 'reaction',
          score: time,
          difficulty: difficulty
        })
      })
    } catch (error) {
      console.error('Failed to submit score:', error)
    }

    // Keep local best time functionality
    const currentBest = localStorage.getItem(`reactionGame_best_${difficulty}`)
    if (!currentBest || time < parseInt(currentBest)) {
      setBestTime(time)
      localStorage.setItem(`reactionGame_best_${difficulty}`, time.toString())
    }
  }, [username, difficulty, bestTime])

  // Trigger ripple animation and play sound
  const triggerRipple = (color) => {
    setRipple({ active: true, color, key: Date.now() })

    // Play appropriate sound
    if (!isMuted) {
      const soundRef = color === 'green' ? validSoundRef : errorSoundRef
      if (soundRef.current) {
        soundRef.current.currentTime = 0
        soundRef.current.play().catch(err => console.log('Audio play failed:', err))
      }
    }

    // Reset ripple after animation completes
    setTimeout(() => {
      setRipple(prev => ({ ...prev, active: false }))
    }, 300)
  }

  // Reset game to initial state
  const resetGame = () => {
    setGameState('idle')
    setRound(1)
    setRoundTimes([])
    setReactionTime(0)
    setFalseStart(false)
    setCountdown(3)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  // Start game countdown
  const startGame = () => {
    if (gameState === 'idle' || gameState === 'results') {
      setRound(1)
      setRoundTimes([])
      setCountdown(3)
      setGameState('waiting')

      // Countdown before first round
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            startRound()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }

  // Start a single round
  const startRound = () => {
    setFalseStart(false)
    setGameState('waiting')
    isProcessingRef.current = false // Reset processing flag for new round

    const config = DIFFICULTY_CONFIG[difficulty]
    const delay = Math.random() * (config.max - config.min) + config.min

    timeoutRef.current = setTimeout(() => {
      setGameState('ready')
      startTimeRef.current = Date.now()
    }, delay)
  }

  // Handle spacebar press
  const handleSpacePress = useCallback(() => {
    if (gameState === 'waiting' || gameState === 'idle') {
      // False start - trigger red ripple
      triggerRipple('red')
      setFalseStart(true)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Wait for ripple animation (300ms) + brief pause (150ms) before restarting
      setTimeout(() => {
        setFalseStart(false)
        if (gameState === 'waiting') {
          startRound()
        }
      }, 450)

      return
    }

    if (gameState === 'ready') {
      // Prevent multiple presses in the same round
      if (isProcessingRef.current) {
        return // Ignore additional presses
      }
      isProcessingRef.current = true // Lock to prevent double-pressing

      // Trigger green ripple immediately
      triggerRipple('green')

      const endTime = Date.now()
      const reaction = endTime - startTimeRef.current
      setReactionTime(reaction)

      const newRoundTimes = [...roundTimes, reaction]
      setRoundTimes(newRoundTimes)

      // Wait for ripple animation (300ms) + transition delay (150ms) before proceeding
      setTimeout(() => {
        // Check if this was the 5th round
        if (newRoundTimes.length >= 5) {
          // Game complete - calculate average and save
          const avgTime = Math.round(newRoundTimes.reduce((a, b) => a + b, 0) / newRoundTimes.length)
          saveScore(avgTime)
          setReactionTime(avgTime)
          setGameState('results')
        } else {
          // Next round
          setRound(round + 1)
          startRound()
        }
      }, 450)
    }
  }, [gameState, roundTimes, round, saveScore])

  // Keyboard event listener for spacebar
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault() // Prevent page scrolling
        handleSpacePress()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleSpacePress])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])


  const getBackgroundColor = () => {
    if (falseStart) return '#EF4444'
    if (gameState === 'idle') return 'hsl(var(--card))'
    if (gameState === 'waiting') return '#DC2626'
    if (gameState === 'ready') return '#10B981'
    if (gameState === 'results') return '#2B7FFF'
    return 'hsl(var(--card))'
  }

  // Get instruction text
  const getInstructionText = () => {
    if (falseStart) return 'Too early! Wait for green...'
    if (countdown > 0 && gameState === 'waiting') return `Starting in ${countdown}...`
    if (gameState === 'idle') return 'Press "Start Game" to begin'
    if (gameState === 'waiting') return 'Wait for green...'
    if (gameState === 'ready') return 'PRESS SPACEBAR NOW!'
    if (gameState === 'results') return `Average: ${reactionTime}ms`
    return ''
  }



  return (
    <>
      <style>{`
        @keyframes ripple-expand {
          0% {
            width: 0;
            height: 0;
            opacity: 0.6;
          }
          100% {
            width: 800px;
            height: 800px;
            opacity: 0;
          }
        }
      `}</style>
      
      {/* Background styling for the page */}
      <div className="min-h-screen bg-[#0d071d] text-white pt-24 pb-12">
        <Link to="/games" className="absolute top-8 left-8 text-[#ff5ea6] hover:text-[#ff8cbe] flex items-center gap-2 font-vt323 text-2xl transition-colors">
          <ChevronLeft /> Back to Arcade
        </Link>
        <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#2B7FFF] to-[#1E40AF] bg-clip-text text-transparent">
              Reaction Time Game
            </h1>
            <div className="text-gray-400 text-lg">
              Test your reflexes! Press SPACEBAR when the box turns green.
            </div>
          </div>

          {/* Username Input */}
          {gameState === 'idle' && (
            <div className="p-6 mb-6">
              <label className="block mb-2">
                <span className="font-bold text-white">Your Name:</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => saveUsername(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B7FFF] text-foreground"
                maxLength={20}
              />
            </div>
          )}

          {/* Difficulty Selection */}
          {gameState === 'idle' && (
            <div className="p-6 mb-6">
              <span className="font-bold text-white mb-4 block">Select Difficulty:</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(Object.keys(DIFFICULTY_CONFIG) ).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`p-4 rounded-lg border-2 transition-all ${difficulty === diff
                      ? 'border-[#2B7FFF] bg-[#2B7FFF]/10'
                      : 'border-border hover:border-[#2B7FFF]/50'
                      }`}
                  >
                    <span className="font-bold text-lg mb-1 block">
                      {DIFFICULTY_CONFIG[diff].label}
                    </span>
                    <span className="text-sm text-gray-400 block">
                      {DIFFICULTY_CONFIG[diff].min / 1000}s - {DIFFICULTY_CONFIG[diff].max / 1000}s delay
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Game Area */}
          <div
            className="mb-4 rounded-xl overflow-hidden select-none transition-all duration-300"
            style={{
              backgroundColor: getBackgroundColor(),
              minHeight: '250px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: gameState === 'ready' ? '4px solid #10B981' : '1px solid hsl(var(--border))',
              boxShadow: gameState === 'ready' ? '0 0 40px rgba(16, 185, 129, 0.5)' : 'none',
              position: 'relative'
            }}
          >
            {/* Ripple Animation */}
            {ripple.active && (
              <div
                key={ripple.key}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '0',
                  height: '0',
                  borderRadius: '50%',
                  backgroundColor: ripple.color === 'green' ? '#FFFFFF' : '#EF4444',
                  opacity: 0.7,
                  pointerEvents: 'none',
                  animation: 'ripple-expand 250ms ease-out forwards'
                }}
              />
            )}

            <div className="text-center p-8" style={{ position: 'relative', zIndex: 1 }}>
              <div
                className={`text-3xl font-bold mb-4 ${gameState === 'waiting' || gameState === 'ready' || falseStart
                  ? 'text-white'
                  : ''
                  }`}
              >
                {getInstructionText()}
              </div>

              {gameState !== 'idle' && gameState !== 'results' && (
                <div
                  className={`text-lg ${gameState === 'waiting' || gameState === 'ready' || falseStart ? 'text-white/80' : 'text-gray-400'}`}
                >
                  Round {round} of 5
                </div>
              )}

              {gameState === 'results' && (
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {roundTimes.map((time, index) => (
                      <div key={index} className="bg-white/10 rounded-lg p-3">
                        <div className="text-white/60 text-sm mb-1">Round {index + 1}</div>
                        <div className="text-white font-bold text-lg">{time}ms</div>
                      </div>
                    ))}
                  </div>

                  {bestTime && reactionTime < bestTime && (
                    <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
                      <span weight="bold" className="text-yellow-300">🎉 New Personal Best!</span>
                    </div>
                  )}

                  {bestTime && reactionTime >= bestTime && (
                    <span className="text-white/80">
                      Your best: {bestTime}ms
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Personal Stats */}
          {bestTime && (
            <div className="mb-2 px-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-400 text-sm mb-1">
                    Personal Best ({DIFFICULTY_CONFIG[difficulty].label})
                  </div>
                  <div className="text-[#2B7FFF] text-2xl font-bold">
                    {bestTime}ms
                  </div>
                </div>
                {gameState === 'results' && (
                  <div className="text-right">
                    <div className="text-gray-400 text-sm mb-1">
                      Current Average
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {reactionTime}ms
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-4 justify-center flex-wrap items-center mt-4 mb-8">
            <button
              onClick={startGame}
              disabled={gameState !== 'idle' && gameState !== 'results'}
              className="px-8 py-3 bg-[#2B7FFF] hover:bg-[#1E40AF] text-white font-vt323 text-3xl rounded transition-colors disabled:opacity-50"
            >
              {gameState === 'idle' ? 'Start Game' : 'Play Again'}
            </button>

            {gameState === 'results' && (
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-[#ff5ea6] hover:bg-[#ff8cbe] text-white font-vt323 text-2xl rounded transition-colors"
              >
                Change Difficulty
              </button>
            )}

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-14 h-14 bg-gray-700 hover:bg-gray-600 text-white rounded flex items-center justify-center text-2xl transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>

          {/* Hidden Audio Elements */}
          <audio ref={validSoundRef} preload="auto">
            <source src="/audio/success_bell-6776.mp3" type="audio/mpeg" />
          </audio>
          <audio ref={errorSoundRef} preload="auto">
            <source src="/audio/error-sound-39539.mp3" type="audio/mpeg" />
          </audio>

          {/* Tips */}
          {gameState === 'idle' && (
            <div className="mt-6 p-6">
              <span weight="bold" className="mb-3">Tips:</span>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Wait for the box to turn <span className="text-green-500 font-bold">GREEN</span> before pressing spacebar</li>
                <li>• Press <span className="font-bold bg-muted px-2 py-0.5 rounded">SPACEBAR</span> only when green!</li>
                <li>• Pressing too early (on red) counts as a false start</li>
                <li>• You'll play exactly 5 rounds - your average time is recorded</li>
                <li>• Higher difficulty = shorter wait times = higher score multiplier</li>
                <li>• Try to beat your personal best!</li>
              </ul>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  )
}

export default ReactionGame
