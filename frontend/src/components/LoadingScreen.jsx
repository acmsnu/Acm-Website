import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen({ onLoadingComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isSplitting, setIsSplitting] = useState(false);

  useEffect(() => {
    // Artificial minimum delay to show the loading screen (e.g. 1.2s)
    // In a real app, this would wait for assets or data to load.
    const initialDelay = setTimeout(() => {
      setIsSplitting(true);
      
      // Let the split animation play, then remove the component entirely
      setTimeout(() => {
        setIsVisible(false);
        if (onLoadingComplete) onLoadingComplete();
      }, 1000); // Wait for the 1s exit animation to finish
    }, 1200);

    return () => clearTimeout(initialDelay);
  }, [onLoadingComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none flex flex-col overflow-hidden">
      
      {/* Center Text (fades out just before split) */}
      <AnimatePresence>
        {!isSplitting && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-[10000]"
          >
            <img src="/acm-logo.webp" alt="ACM Logo" className="w-24 h-24 mb-6 drop-shadow-[0_0_15px_rgba(255,94,166,0.8)] animate-pulse" />
            <h1 className="font-pixelify text-5xl md:text-7xl text-white drop-shadow-[4px_4px_0_rgba(255,94,166,1)] tracking-widest animate-pulse">
              LOADING
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Door */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isSplitting ? '-100%' : 0 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        className="w-full h-[50vh] bg-[#0d071d] border-b-[4px] border-[#ff5ea6] shadow-[0_10px_30px_rgba(255,94,166,0.5)] relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(/bgclouds2.webp)', backgroundSize: 'cover', imageRendering: 'pixelated' }}></div>
      </motion.div>

      {/* Bottom Door */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isSplitting ? '100%' : 0 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        className="w-full h-[50vh] bg-[#0d071d] border-t-[4px] border-[#ff5ea6] shadow-[0_-10px_30px_rgba(255,94,166,0.5)] relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(/bgclouds2.webp)', backgroundSize: 'cover', imageRendering: 'pixelated', backgroundPosition: 'bottom' }}></div>
      </motion.div>

    </div>
  );
}
