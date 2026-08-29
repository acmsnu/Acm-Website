import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen({ onLoadingComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(window.preloaderProgress || 0);

  useEffect(() => {
    // Clear the native preloader interval if it exists
    if (window.preloaderInterval) {
      clearInterval(window.preloaderInterval);
    }

    // Fake progress bar filling up
    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return p + Math.floor(Math.random() * 8) + 2; // Random jumps between 2-10%
      });
    }, 200);

    // Keep screen visible for a bit, then fade out
    const initialDelay = setTimeout(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        if (onLoadingComplete) onLoadingComplete();
      }, 800); // Wait for the fade out animation to finish
    }, 3000); // Wait for 3s

    return () => {
      clearTimeout(initialDelay);
      clearInterval(progressInterval);
    };
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-[#0d071d] flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Background Images */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Desktop Image */}
            <img 
              src="/loadingscreentouse.webp?v=2" 
              alt="Loading Background" 
              className="hidden md:block w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
            />
            {/* Mobile Image */}
            <img 
              src="/loadingscreenphones.webp?v=2" 
              alt="Loading Background" 
              className="md:block hidden md:!hidden block w-full h-full object-cover" 
              style={{ imageRendering: 'pixelated', display: 'block' }}
            />
            {/* Tailwind fix for mobile image block above: */}
          </div>

          {/* Let's fix the mobile image display cleanly via tailwind classes */}
          <style>{`
            .mobile-img { display: block; }
            @media (min-width: 768px) { .mobile-img { display: none !important; } }
          `}</style>
          
          <img src="/loadingscreenphones.webp?v=2" alt="" className="mobile-img absolute inset-0 w-full h-full object-cover pointer-events-none -z-10" style={{ imageRendering: 'pixelated' }} />

          {/* Overlay Content (Progress Bar) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-8 md:mt-32 z-10 flex flex-col items-center">
            {/* Progress Bar Container */}
            <div className="w-64 md:w-96 h-3 md:h-4 bg-black/80 rounded-full border-[2px] border-[#ff5ea6] overflow-hidden shadow-[0_0_15px_rgba(255,94,166,0.6)]">
              {/* Progress Bar Fill */}
              <div 
                className="h-full bg-gradient-to-r from-[#ff5ea6] to-[#a8a0ff] transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
