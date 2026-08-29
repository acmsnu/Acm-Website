import React, { useState, useEffect } from 'react';
import { fetchAllEvents } from '../utils/api';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const eventsPerPage = 4;

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchAllEvents();
        setEvents(data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadEvents();
    
    // Force scroll to top on mount/reload
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  // Filter events based on search query
  const filteredEvents = events.filter(e => 
    e.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate stars background
  const [stars, setStars] = useState([]);
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
  }, []);

  return (
    <div className="min-h-screen bg-[#0d071d] text-white selection:bg-pink-500 overflow-x-hidden relative flex flex-col">
      
      {/* Global Background Stars */}
      <div className="absolute inset-0 pointer-events-none z-0 fixed">
        {stars.map((star) => (
          <div
            key={star.id}
            className={`absolute ${star.type === 'circle' ? 'rounded-full' : ''} ${star.size} ${star.color} animate-pulse`}
            style={{
              top: star.top,
              left: star.left,
              animationDelay: star.delay,
              boxShadow: star.type === 'star' ? '0 -4px 0 0 currentColor, 0 4px 0 0 currentColor, -4px 0 0 0 currentColor, 4px 0 0 0 currentColor' : 'none',
              color: star.color.includes('white') ? 'white' : star.color.includes('ff8cbe') ? '#ff8cbe' : '#a8a0ff'
            }}
          />
        ))}
      </div>

      {/* Background Clouds */}
      <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none z-0 flex items-center justify-center opacity-30 fixed">
        <img src="/bgclouds2.webp" alt="Background Clouds" className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
      </div>
      <img src="/cloud2.webp" alt="" className="fixed top-[15%] left-4 w-40 md:w-56 pointer-events-none z-0 opacity-60" style={{ imageRendering: 'pixelated' }} />
      <img src="/cloud1.webp" alt="" className="fixed top-[30%] right-4 w-48 md:w-64 pointer-events-none z-0 opacity-60" style={{ imageRendering: 'pixelated' }} />

      {/* Decorative Text - Top Right */}
      <div className="hidden lg:flex fixed top-24 right-8 flex-col items-end z-0 pointer-events-none">
        <div className="border-[1px] border-dashed border-gray-500/50 p-4 pb-8 relative">
          <p className="font-vt323 text-xl tracking-[0.3em] leading-loose text-gray-400 text-right uppercase">
            IDEAS<br/>CODE<br/>PEOPLE<br/>IMPACT
          </p>
          <div className="absolute -bottom-3 -right-3 text-[#ff5ea6] font-pixelify text-xl drop-shadow-[0_0_5px_rgba(255,94,166,0.8)]">✦</div>
        </div>
      </div>

      {/* Decorative Boombox - Bottom Left */}
      <div className="hidden xl:block fixed bottom-[3rem] left-[0rem] z-0 pointer-events-none">
        {/* CSS Speech Bubble */}
        <div className="relative bg-[#1a0f30] border-2 border-[#ff8cbe] rounded-xl p-4 mb-4 shadow-[4px_4px_0_rgba(255,140,190,0.4)] transform -rotate-6 ml-12">
          <p className="font-vt323 text-xl leading-tight text-[#ff8cbe] text-center tracking-wide font-bold">
            EVENTS<br/>BRING US<br/>TOGETHER!
          </p>
          {/* Bubble Tail */}
          <div className="absolute -bottom-[10px] left-6 w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-[#ff8cbe] border-r-[10px] border-r-transparent"></div>
          <div className="absolute -bottom-[6px] left-[26px] w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-[#1a0f30] border-r-[6px] border-r-transparent"></div>
        </div>
        <img src="/boombox.webp" alt="Boombox" className="w-48 h-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" style={{ imageRendering: 'pixelated' }} />
      </div>

      {/* Decorative Cat - Bottom Right */}
      <div className="hidden xl:flex fixed bottom-[3.3rem] right-6 z-0 pointer-events-none flex-col items-center">
        {/* Zzz Animation */}
        <div className="flex justify-end w-full pr-8 -mb-4">
          <p className="font-pixelify text-2xl text-white opacity-70 animate-bounce delay-75" style={{ textShadow: '1px 1px 0 #000' }}>Z</p>
          <p className="font-pixelify text-xl text-white opacity-60 animate-bounce delay-150 -mt-4 ml-2" style={{ textShadow: '1px 1px 0 #000' }}>z</p>
          <p className="font-pixelify text-lg text-white opacity-50 animate-bounce delay-300 -mt-8 ml-2" style={{ textShadow: '1px 1px 0 #000' }}>z</p>
        </div>
        <img src="/cat.webp" alt="Sleeping Cat" className="w-40 h-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" style={{ imageRendering: 'pixelated' }} />
      </div>


      {/* Navbar Minimal */}
      <header className="flex flex-col p-3 xl:p-6 z-20 relative gap-4">
        {/* Top Row: Logos & Nav */}
        <div className="flex justify-between items-center w-full">
          <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform shrink-0">
            <img src="/acm-logo.webp" alt="ACM Logo" className="w-12 h-12 md:w-13 xl:w-14 xl:h-14" style={{ imageRendering: 'auto' }} />
            <img src="/logoacnsnioe.webp" alt="ACM SNIOE Logo" className="h-10 md:h-14 xl:h-16 w-auto pointer-events-none" style={{ imageRendering: 'pixelated' }} />
          </Link>
          
          <div className="flex items-center gap-4 xl:gap-6">
            {/* Search Bar - Desktop Only (Left of links) */}
            <div className="hidden md:flex relative w-64 border-2 border-[#3b2d1d] rounded-lg overflow-hidden bg-[#1a0f30]/80 items-center">
              <span className="pl-3 text-gray-400">🔍</span>
              <input 
                type="text" 
                placeholder="Search events..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-transparent text-white font-vt323 text-xl py-1.5 px-3 focus:outline-none focus:bg-[#3b2d1d]/30 transition-colors placeholder:text-gray-500"
              />
            </div>

            {/* Right Side: Navigation & Actions */}
            <div className="flex items-center gap-2 md:gap-4 xl:gap-6 relative z-50">
              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-4 xl:gap-6 font-vt323 text-xl md:text-2xl xl:tracking-wider">
                <Link to="/" className="hover:underline underline-offset-4 decoration-2">Home</Link>
                <Link to="/events" className="text-[#ff5ea6] underline underline-offset-4 decoration-2 font-bold">Events</Link>
                <Link to="/games" className="hover:underline underline-offset-4 decoration-2 text-[#a8a0ff] hover:text-[#ff5ea6] drop-shadow-[0_0_5px_rgba(168,160,255,0.5)]">Games</Link>
              </nav>

              {/* Mobile Nav Toggle */}
              <button 
                className="md:hidden text-[#ff8cbe] hover:text-[#ff5ea6] transition-colors p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
              </button>

              {/* Admin Book (Always visible) */}
              <Link to="/admin/login" className="flex items-center" title="Admin Login">
                <img src="/bookgif.gif" alt="Animated Book" className="w-10 h-10 xl:w-12 xl:h-12 hover:scale-110 transition-transform cursor-pointer" style={{ imageRendering: 'pixelated' }} />
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-[#1a0f30]/95 backdrop-blur-md border-b border-[#ff5ea6]/30 p-6 flex flex-col items-center gap-6 font-vt323 text-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-40 md:hidden"
            >
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#ff8cbe]">Home</Link>
              <Link to="/events" onClick={() => setIsMobileMenuOpen(false)} className="text-[#ff5ea6] underline underline-offset-4 decoration-2 font-bold">Events</Link>
              <Link to="/games" onClick={() => setIsMobileMenuOpen(false)} className="text-[#a8a0ff] hover:text-[#ff5ea6]">Games</Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Bar - Mobile Only (Below links) */}
        <div className="md:hidden relative w-full border-2 border-[#3b2d1d] rounded-lg overflow-hidden bg-[#1a0f30]/80 flex items-center">
          <span className="pl-3 text-gray-400">🔍</span>
          <input 
            type="text" 
            placeholder="Search events..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-transparent text-white font-vt323 text-xl py-2 px-3 focus:outline-none focus:bg-[#3b2d1d]/30 transition-colors placeholder:text-gray-500"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 z-10 w-full max-w-[1600px] mx-auto px-4 pt-2 pb-4 lg:pb-6 lg:px-12 xl:px-16 relative flex flex-col justify-center">
        
        {/* Header Area */}
        <div className="text-center mb-4 xl:-mt-8">
          <h1 className="font-pixelify text-5xl md:text-7xl text-white drop-shadow-[4px_4px_0_rgba(0,0,0,0.8)] mb-2 uppercase flex items-center justify-center gap-4">
            <span className="w-12 h-12 md:w-16 md:h-16 inline-flex bg-[#1a0f30] border-[3px] border-white rounded-xl items-center justify-center shrink-0">
              <span className="text-2xl md:text-3xl">★</span>
            </span>
            OUR EVENTS
          </h1>
          <p className="font-vt323 text-2xl md:text-3xl text-[#ff5ea6] max-w-2xl mx-auto drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)] mb-4 font-bold tracking-widest uppercase">
            Build ✦ Learn ✦ Compete ✦ Connect
          </p>
          <p className="font-vt323 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Workshops, hackathons, talks, and more. Explore our upcoming and past events and be a part of the ACM SNIOE journey.
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <img src="/bookgif.gif" alt="Loading" className="w-16 h-16" style={{ imageRendering: 'pixelated' }} />
            <p className="font-vt323 text-3xl text-gray-400 animate-pulse">Loading events data...</p>
          </div>
        ) : (
          <>
            {/* Event Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 mb-12 relative z-20">
              {currentEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedEvent(event)}
                  className="bg-[#1a0f30]/90 rounded-xl overflow-hidden border-[3px] border-[#3b2d1d] shadow-[6px_6px_0_rgba(255,94,166,0.2)] hover:shadow-[6px_6px_0_rgba(255,94,166,0.5)] transition-all flex flex-col group cursor-pointer backdrop-blur-sm"
                >
                  <div className="w-full h-32 md:h-40 xl:h-48 relative overflow-hidden bg-black/60 border-b-[3px] border-[#3b2d1d]">
                    <img
                      src={event.image_url || "/eventplaceholder.webp"}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out opacity-80 group-hover:opacity-100"
                    />
                    {event.is_featured && (
                      <div className="absolute top-3 right-3 bg-[#ff5ea6] text-black font-vt323 font-bold px-3 py-1 rounded-full shadow-[2px_2px_0_rgba(0,0,0,0.8)] border-2 border-black text-xs uppercase tracking-wider">
                        Featured
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 xl:p-5 flex flex-col flex-1">
                    <h3 className="font-pixelify text-xl md:text-2xl text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] mb-2 leading-tight">
                      {event.title}
                    </h3>
                    
                    <div className="flex flex-row justify-between items-center font-vt323 text-base text-[#ff8cbe] mb-2 pb-2 border-b border-[#3b2d1d]/50">
                      <span className="flex items-center gap-1 drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
                        <span className="text-lg">🗓️</span> {event.date || 'TBA'}
                      </span>
                      <span className="flex items-center gap-1 drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)] text-right">
                        <span className="text-lg">📍</span> {event.location || 'TBA'}
                      </span>
                    </div>

                    <p className="font-vt323 text-base md:text-lg text-gray-300 leading-relaxed flex-1 line-clamp-2 xl:line-clamp-4 mb-4">
                      {event.description}
                    </p>

                    <div className="mt-auto flex justify-end">
                      <button className="font-vt323 text-base md:text-lg border-2 border-[#ff5ea6] text-[#ff5ea6] hover:bg-[#ff5ea6] hover:text-black px-4 py-1.5 rounded transition-colors uppercase tracking-widest font-bold shadow-[2px_2px_0_rgba(0,0,0,0.5)] flex items-center gap-2 group-hover:bg-[#ff5ea6] group-hover:text-black">
                        View Details <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {filteredEvents.length === 0 && (
              <div className="text-center py-20 bg-[#1a0f30]/50 border-2 border-[#3b2d1d] rounded-xl relative z-20">
                <p className="font-vt323 text-3xl text-gray-400">No events found matching your search.</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-6 font-vt323 text-xl text-[#ff5ea6] underline hover:text-white transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-2 mb-2 relative z-20">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-vt323 text-xl md:text-2xl border-2 border-[#3b2d1d] rounded bg-[#1a0f30] text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ←
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-vt323 text-xl md:text-2xl border-2 rounded transition-colors ${
                      currentPage === i + 1 
                        ? 'bg-[#ff5ea6] border-[#ff5ea6] text-black font-bold shadow-[2px_2px_0_rgba(0,0,0,0.8)]' 
                        : 'bg-[#1a0f30] border-[#3b2d1d] text-gray-400 hover:text-white hover:border-gray-500'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-vt323 text-xl md:text-2xl border-2 border-[#3b2d1d] rounded bg-[#1a0f30] text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer Ticker */}
      <div className="w-full bg-[#1a0f30] border-t-2 border-[#ff8cbe] py-2 md:py-3 overflow-hidden whitespace-nowrap z-20 font-vt323 text-base md:text-lg text-gray-300 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] mt-auto">
        <div className="animate-[marquee_30s_linear_infinite] inline-block">
          <span className="text-[#ff8cbe] font-silkscreen mx-4">ACM SNIOE</span>
          Empowering students to innovate, build, and lead the future of technology through collaborative learning and real-world projects.
          <span className="text-[#ff8cbe] font-silkscreen mx-4">ACM SNIOE</span>
          Empowering students to innovate, build, and lead the future of technology through collaborative learning and real-world projects.
          <span className="text-[#ff8cbe] font-silkscreen mx-4">ACM SNIOE</span>
          Empowering students to innovate, build, and lead the future of technology through collaborative learning and real-world projects.
        </div>
      </div>

      {/* Event Detail Modal Popup */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-[#0d071d] border-[4px] border-[#ff5ea6] rounded-xl relative max-w-4xl w-full flex flex-col md:flex-row overflow-hidden shadow-[0_0_40px_rgba(255,94,166,0.3)] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                className="absolute top-3 right-4 text-white hover:text-[#ff5ea6] font-pixelify text-3xl transition-colors z-10 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur"
                onClick={() => setSelectedEvent(null)}
              >
                ×
              </button>
              
              {/* Left: Image */}
              <div className="w-full md:w-2/5 h-64 md:h-auto bg-black border-b-[4px] md:border-b-0 md:border-r-[4px] border-[#ff5ea6] relative shrink-0">
                <img 
                  src={selectedEvent.image_url || "/eventplaceholder.webp"} 
                  alt={selectedEvent.title} 
                  className="w-full h-full object-cover" 
                />
                {selectedEvent.is_featured && (
                  <div className="absolute top-4 left-4 bg-[#ff5ea6] text-black font-vt323 font-bold px-3 py-1 rounded shadow-lg border-2 border-black uppercase text-sm">
                    Featured
                  </div>
                )}
              </div>
              
              {/* Right: Content */}
              <div className="p-6 md:p-8 flex flex-col flex-1 overflow-y-auto custom-scrollbar bg-[#1a0f30]/50">
                <h2 className="font-pixelify text-3xl md:text-5xl text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] mb-6 leading-tight pr-8">
                  {selectedEvent.title}
                </h2>
                
                <div className="flex flex-wrap gap-4 md:gap-8 font-vt323 text-xl md:text-2xl text-[#ff8cbe] mb-6 p-4 bg-[#0d071d] rounded-lg border-2 border-[#3b2d1d] shadow-inner font-bold">
                  <div className="flex items-center gap-2 drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
                    <span className="text-2xl">🗓️</span> {selectedEvent.date || 'TBA'}
                  </div>
                  <div className="flex items-center gap-2 drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
                    <span className="text-2xl">📍</span> {selectedEvent.location || 'TBA'}
                  </div>
                </div>

                <div className="font-vt323 text-xl md:text-2xl text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {selectedEvent.description}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
