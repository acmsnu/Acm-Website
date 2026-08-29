import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

export default function GamesHub() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [stars, setStars] = useState([]);
  const [pacmanScores, setPacmanScores] = useState([]);
  const [reactionScores, setReactionScores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Leaderboards
  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const [pacmanRes, reactionRes] = await Promise.all([
          fetch(`${API_BASE_URL}/leaderboard/pacman`),
          fetch(`${API_BASE_URL}/leaderboard/reaction`)
        ]);

        if (pacmanRes.ok) setPacmanScores(await pacmanRes.json());
        if (reactionRes.ok) setReactionScores(await reactionRes.json());
      } catch (error) {
        console.error('Failed to fetch leaderboards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboards();
  }, []);

  // Generate stars background
  useEffect(() => {
    setStars(Array.from({ length: 75 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() > 0.5 ? 'w-0.5 h-0.5' : 'w-1 h-1',
      type: Math.random() > 0.85 ? 'star' : 'circle',
      color: Math.random() > 0.9 ? 'bg-[#ff8cbe]' : (Math.random() > 0.9 ? 'bg-[#a8a0ff]' : 'bg-white'),
      delay: `${Math.random() * 4}s`
    })));
    
    // Force scroll to top on mount/reload
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  const games = [
    {
      id: 'pacman',
      title: 'Pac-Man',
      description: 'Classic arcade action! Eat dots, avoid ghosts, and find the hidden portal...',
      path: '/games/pacman',
      image: '/acm-logo.webp', 
      color: 'from-yellow-400 to-orange-500',
    },
    {
      id: 'reaction',
      title: 'Reaction Time',
      description: 'Test your reflexes! Press spacebar when the screen turns green.',
      path: '/games/reaction',
      image: '/acm-logo.webp',
      color: 'from-green-400 to-blue-500',
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d071d] text-white selection:bg-pink-500 overflow-x-hidden relative flex flex-col">
      
      {/* Global Background Stars */}
      <div className="absolute inset-0 pointer-events-none z-0 fixed">
        {stars.map((star) => (
          <div
            key={star.id}
            className={`absolute ${star.color} ${star.size} rounded-full animate-twinkle`}
            style={{
              top: star.top,
              left: star.left,
              animationDelay: star.delay,
              clipPath: star.type === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : 'none'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Navbar */}
        <header className="flex justify-between items-center p-3 xl:p-6 z-50 relative">
          <div className="flex items-center gap-3 relative z-50">
            <Link to="/">
              <img src="/acm-logo.webp" alt="ACM Logo" className="w-12 h-12 md:w-13 xl:w-14 xl:h-14 hover:scale-110 transition-transform" style={{ imageRendering: 'auto' }} />
            </Link>
            <Link to="/">
              <img src="/logoacnsnioe.webp" alt="ACM SNIOE Logo" className="h-10 md:h-14 xl:h-16 w-auto hover:scale-105 transition-transform" style={{ imageRendering: 'pixelated' }} />
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4 xl:gap-6 relative z-50">
            <nav className="hidden md:flex items-center gap-4 xl:gap-6 font-vt323 text-xl md:text-2xl xl:tracking-wider">
              <Link to="/" className="hover:underline underline-offset-4 decoration-2">Home</Link>
              <Link to="/events" className="hover:underline underline-offset-4 decoration-2">Events</Link>
              <Link to="/games" className="text-[#ff5ea6] underline underline-offset-4 decoration-2 font-bold">Arcade</Link>
            </nav>

            <button 
              className="md:hidden text-[#ff8cbe] hover:text-[#ff5ea6] transition-colors p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
            <Link to="/admin/login" className="flex items-center" title="Admin Login">
              <img src="/bookgif.gif" alt="Animated Book" className="w-10 h-10 xl:w-12 xl:h-12 hover:scale-110 transition-transform cursor-pointer" style={{ imageRendering: 'pixelated' }} />
            </Link>
          </div>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-full left-0 right-0 bg-[#1a0f30]/95 backdrop-blur-md border-b border-[#ff5ea6]/30 p-6 flex flex-col items-center gap-6 font-vt323 text-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-40 md:hidden"
              >
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#ff8cbe]">Home</Link>
                <Link to="/events" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#ff8cbe]">Events</Link>
                <Link to="/games" onClick={() => setIsMobileMenuOpen(false)} className="text-[#ff5ea6] underline underline-offset-4 decoration-2 font-bold">Arcade</Link>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-start text-center px-4 pt-8 pb-32 max-w-5xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-vt323 text-[#ff5ea6] mb-4 drop-shadow-[0_0_15px_rgba(255,94,166,0.6)]">
              ARCADE
            </h1>
            <p className="text-[#ff8cbe] text-lg md:text-xl font-vt323 max-w-2xl mx-auto tracking-widest">
              PLAY CLASSIC GAMES & COMPETE ON THE LEADERBOARD!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mx-auto">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Link 
                  to={game.path}
                  className="block bg-[#1a0f30]/60 backdrop-blur-sm border-2 border-[#ff5ea6]/30 rounded-xl overflow-hidden hover:border-[#ff5ea6] transition-all hover:shadow-[0_0_30px_rgba(255,94,166,0.4)] group"
                >
                  <div className={`h-32 bg-gradient-to-br ${game.color} opacity-80 flex items-center justify-center group-hover:opacity-100 transition-opacity`}>
                    <img src={game.image} alt={game.title} className="h-16 w-16 object-contain filter drop-shadow-lg" />
                  </div>
                  <div className="p-6 text-left">
                    <h2 className="text-3xl font-vt323 text-white mb-2 group-hover:text-[#ff5ea6] transition-colors">{game.title}</h2>
                    <p className="text-gray-400 font-sans text-sm mb-4">{game.description}</p>
                    <div className="inline-flex items-center text-[#ff5ea6] font-vt323 text-xl uppercase tracking-widest group-hover:text-white transition-colors">
                      <span className="mr-2">▶</span> Play Now
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Leaderboard Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-6xl mx-auto mt-24"
          >
            <h2 className="text-4xl md:text-5xl font-vt323 text-[#a8a0ff] mb-8 drop-shadow-[0_0_10px_rgba(168,160,255,0.6)]">
              HALL OF FAME
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              {/* Pac-Man Leaderboard */}
              <div className="bg-[#1a0f30]/60 backdrop-blur-sm border-2 border-[#a8a0ff]/30 rounded-xl p-6 relative overflow-hidden">
                <h3 className="text-3xl font-vt323 text-yellow-400 mb-6 flex items-center justify-center gap-2 relative z-10">
                  PAC-MAN TOP 50
                </h3>
                
                {loading ? (
                  <div className="text-gray-400 font-vt323 text-xl relative z-10">Loading scores...</div>
                ) : pacmanScores.length === 0 ? (
                  <div className="text-gray-400 font-vt323 text-xl relative z-10">No scores yet. Be the first!</div>
                ) : (
                  <div className="overflow-y-auto max-h-[400px] pr-2 custom-scrollbar relative z-10">
                    <table className="w-full font-vt323 text-xl text-left border-collapse">
                      <thead>
                        <tr className="text-[#a8a0ff] border-b border-[#a8a0ff]/30">
                          <th className="pb-3 w-16 text-center">Rank</th>
                          <th className="pb-3">Player</th>
                          <th className="pb-3 text-right">Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pacmanScores.map((score, idx) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-3 text-gray-400 text-center">
                              {idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                            </td>
                            <td className="py-3 text-white truncate max-w-[120px] font-bold">{score.nickname}</td>
                            <td className="py-3 text-yellow-400 text-right font-bold">{score.best_score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Reaction Time Leaderboard */}
              <div className="bg-[#1a0f30]/60 backdrop-blur-sm border-2 border-[#a8a0ff]/30 rounded-xl p-6 relative overflow-hidden">
                <h3 className="text-3xl font-vt323 text-green-400 mb-6 flex items-center justify-center gap-2 relative z-10">
                  REACTION TIME TOP 50
                </h3>
                
                {loading ? (
                  <div className="text-gray-400 font-vt323 text-xl relative z-10">Loading scores...</div>
                ) : reactionScores.length === 0 ? (
                  <div className="text-gray-400 font-vt323 text-xl relative z-10">No scores yet. Be the first!</div>
                ) : (
                  <div className="overflow-y-auto max-h-[400px] pr-2 custom-scrollbar relative z-10">
                    <table className="w-full font-vt323 text-xl text-left border-collapse">
                      <thead>
                        <tr className="text-[#a8a0ff] border-b border-[#a8a0ff]/30">
                          <th className="pb-3 w-16 text-center">Rank</th>
                          <th className="pb-3">Player</th>
                          <th className="pb-3 text-center">Mode</th>
                          <th className="pb-3 text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reactionScores.map((score, idx) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-3 text-gray-400 text-center">
                              {idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                            </td>
                            <td className="py-3 text-white truncate max-w-[100px] font-bold">{score.nickname}</td>
                            <td className="py-3 text-gray-400 text-center text-sm">{score.difficulty || '-'}</td>
                            <td className="py-3 text-green-400 text-right font-bold">{score.best_score}ms</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
