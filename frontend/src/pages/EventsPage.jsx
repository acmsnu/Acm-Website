import React, { useState, useEffect } from 'react';
import { fetchAllEvents } from '../utils/api';
import { Link } from 'react-router-dom';
import SplitText from '../components/SplitText';
import { motion } from 'framer-motion';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
  }, []);

  return (
    <div className="min-h-screen bg-[#0d071d] text-white selection:bg-pink-500 overflow-x-hidden relative flex flex-col">
      {/* Background Clouds */}
      <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none z-0 flex items-center justify-center opacity-30">
        <img src="/bgclouds2.webp" alt="Background Clouds" className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
      </div>

      {/* Navbar Minimal */}
      <header className="flex justify-between items-center p-4 xl:p-6 z-20 relative">
        <Link to="/" className="flex items-center gap-3 hover:scale-105 transition-transform">
          <img src="/acm-logo.webp" alt="ACM Logo" className="w-12 h-12" style={{ imageRendering: 'auto' }} />
          <img src="/logoacnsnioe.webp" alt="ACM SNIOE Logo" className="h-8 md:h-12 w-auto pointer-events-none" style={{ imageRendering: 'pixelated' }} />
        </Link>
        <Link to="/" className="font-vt323 text-xl md:text-2xl hover:text-[#ff5ea6] transition-colors border-b-2 border-transparent hover:border-[#ff5ea6]">
          ← Back to Hub
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 z-10 w-full max-w-7xl mx-auto px-4 pt-8 pb-20">
        <div className="text-center mb-16">
          <h1 className="font-pixelify text-5xl md:text-7xl text-white drop-shadow-[4px_4px_0_rgba(0,0,0,0.8)] mb-4 uppercase">
            All <span className="text-[#ff5ea6]">Quests</span>
          </h1>
          <p className="font-vt323 text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
            Explore the complete archive of our past and upcoming adventures.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center font-vt323 text-3xl text-gray-400 animate-pulse">Loading events data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -10 }}
                className="bg-[#1a0f30]/80 rounded-xl overflow-hidden border-[3px] border-[#3b2d1d] shadow-[8px_8px_0_rgba(255,94,166,0.3)] transition-all flex flex-col group cursor-pointer"
              >
                <div className="w-full h-48 md:h-56 relative overflow-hidden bg-black/40 border-b-[3px] border-[#3b2d1d]">
                  <img
                    src={event.image_url || "/eventplaceholder.webp"}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {event.is_featured ? (
                    <div className="absolute top-2 right-2 bg-[#ff5ea6] font-vt323 text-white px-2 py-1 rounded shadow-lg border-2 border-black text-sm uppercase">
                      Featured
                    </div>
                  ) : null}
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-pixelify text-2xl md:text-3xl text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)] mb-2">
                    {event.title}
                  </h3>
                  
                  <div className="flex flex-col gap-1 font-vt323 text-lg text-[#ff8cbe] mb-4">
                    <span className="flex items-center gap-2">
                      <span className="text-xl">🗓️</span> {event.date || 'TBA'}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-xl">📍</span> {event.location || 'TBA'}
                    </span>
                  </div>

                  <p className="font-vt323 text-lg text-gray-300 leading-snug flex-1 line-clamp-4">
                    {event.description}
                  </p>
                </div>
              </motion.div>
            ))}

            {events.length === 0 && (
              <div className="col-span-full text-center py-20 font-vt323 text-3xl text-gray-500">
                No quests available at the moment.
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer Ticker */}
      <div className="w-full bg-[#1a0f30] border-t-2 border-[#ff8cbe] py-2 md:py-3 overflow-hidden whitespace-nowrap z-20 font-vt323 text-base md:text-lg text-gray-300 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
        <div className="animate-[marquee_30s_linear_infinite] inline-block">
          <span className="text-[#ff8cbe] font-silkscreen mx-4">ACM SNIOE</span>
          Empowering students to innovate, build, and lead the future of technology through collaborative learning and real-world projects.
        </div>
      </div>
    </div>
  );
}
