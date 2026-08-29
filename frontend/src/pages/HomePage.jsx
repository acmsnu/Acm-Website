import React, { useRef, useState, useEffect } from 'react';
import SplitText from '../components/SplitText';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { fetchTeam, fetchFeaturedEvents } from '../utils/api';
import { Menu, X } from 'lucide-react';

export default function HomePage() {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [coreMembers, setCoreMembers] = useState([]);
  const [subcoreMembers, setSubcoreMembers] = useState([]);
  const [facultyMembers, setFacultyMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const loadData = async () => {
      try {
        const [eventsData, teamData] = await Promise.all([
          fetchFeaturedEvents(),
          fetchTeam()
        ]);
        setFeaturedEvents(eventsData);
        setCoreMembers(teamData.core);
        setSubcoreMembers(teamData.subcore);
        setFacultyMembers(teamData.faculty || []);
      } catch (err) {
        console.error("Failed to fetch homepage data", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();

    // Force scroll to top on mount/reload
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    featuredEvents.forEach(event => {
      const src = event.image_url || event.image || "/eventplaceholder.webp";
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  }, [featuredEvents]);

  // Mobile Marquee Auto-scroll Logic (Smooth Sub-pixel using translate3d)
  useEffect(() => {
    if (window.innerWidth > 768) return;

    const marquees = document.querySelectorAll('.mobile-marquee');
    if (!marquees.length) return;

    let animationFrameId;

    // State for each track
    const tracksState = Array.from(marquees).map(el => ({
      el,
      xPos: 0,
      isTouching: false,
      lastTouchX: 0,
      startX: 0,
      startY: 0,
      isHorizontal: null,
      speed: parseFloat(el.getAttribute('data-speed') || "0.5")
    }));

    const handleTouchStart = (e, state) => {
      state.isTouching = true;
      state.lastTouchX = e.touches[0].clientX;
      state.startX = e.touches[0].clientX;
      state.startY = e.touches[0].clientY;
      state.isHorizontal = null;
    };

    const handleTouchMove = (e, state) => {
      if (!state.isTouching) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;

      if (state.isHorizontal === null) {
        const dx = Math.abs(currentX - state.startX);
        const dy = Math.abs(currentY - state.startY);
        if (dx > 5 || dy > 5) {
          state.isHorizontal = dx > dy;
        }
      }

      if (state.isHorizontal) {
        if (e.cancelable) e.preventDefault(); // Stop native vertical scroll
        const deltaX = currentX - state.lastTouchX;
        state.xPos += deltaX;
        state.lastTouchX = currentX;
        state.el.style.transform = `translate3d(${state.xPos}px, 0, 0)`;
      }
    };

    const handleTouchEnd = (state) => {
      setTimeout(() => { state.isTouching = false; }, 1000);
    };

    tracksState.forEach(state => {
      state.el.addEventListener('touchstart', (e) => handleTouchStart(e, state), { passive: true });
      state.el.addEventListener('touchmove', (e) => handleTouchMove(e, state), { passive: false });
      state.el.addEventListener('touchend', () => handleTouchEnd(state), { passive: true });
      state.el.addEventListener('touchcancel', () => handleTouchEnd(state), { passive: true });
    });

    const scroll = () => {
      tracksState.forEach((state) => {
        if (!state.isTouching) {
          state.xPos -= state.speed; // subtract speed to move left

          // Loop logic: width of 1 original set is scrollWidth / 4
          const setWidth = state.el.scrollWidth / 4;

          if (state.speed > 0 && state.xPos <= -setWidth * 2) {
            state.xPos += setWidth;
          } else if (state.speed < 0 && state.xPos >= 0) {
            state.xPos -= setWidth;
          }

          state.el.style.transform = `translate3d(${state.xPos}px, 0, 0)`;
        }
      });
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
      tracksState.forEach(state => {
        state.el.removeEventListener('touchstart', handleTouchStart);
        state.el.removeEventListener('touchmove', handleTouchMove);
        state.el.removeEventListener('touchend', handleTouchEnd);
        state.el.removeEventListener('touchcancel', handleTouchEnd);
      });
    };
  }, [subcoreMembers]);

  const handleNextEvent = () => {
    setCurrentEventIndex((prev) => (prev + 1) % featuredEvents.length);
  };

  const handlePrevEvent = () => {
    setCurrentEventIndex((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length);
  };

  // Auto-advance featured events every 6 seconds
  useEffect(() => {
    if (featuredEvents.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % featuredEvents.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [featuredEvents.length, currentEventIndex]);

  const currentEvent = featuredEvents.length > 0 ? featuredEvents[currentEventIndex] : {
    title: 'Check back soon!',
    image_url: '/eventplaceholder.webp',
    description: 'We are currently planning our next exciting events. Stay tuned!',
    date: 'TBA',
    location: 'TBA'
  };

  const { scrollY } = useScroll();
  const yStars = useTransform(scrollY, [0, 3000], [0, -400]);
  const yClouds = useTransform(scrollY, [0, 2000], [0, 200]);

  const aboutRef = useRef(null);
  const { scrollYProgress: aboutProgress } = useScroll({
    target: aboutRef,
    offset: ["start end", "end start"]
  });

  const scaleHeading = useTransform(aboutProgress, [0, 0.4], [0.8, 1.2]);
  const yHeading = useTransform(aboutProgress, [0, 0.4], [50, 0]);
  const opacityHeading = useTransform(aboutProgress, [0, 0.4], [0, 1]);

  const fadeOutParas = useTransform(aboutProgress, [0.55, 0.7], [1, 0]);
  const fadeOutMission = useTransform(aboutProgress, [0.85, 1.0], [1, 0]);

  // Generate a random starry sky that spans down the entire page
  const stars = React.useMemo(() => {
    return Array.from({ length: 350 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 95}%`, // 95% ensures it goes until a bit below the About Us part
      left: `${Math.random() * 100}%`,
      size: Math.random() > 0.5 ? 'w-0.5 h-0.5' : 'w-1 h-1',
      type: Math.random() > 0.85 ? 'star' : 'circle',
      color: Math.random() > 0.9 ? 'bg-[#ff8cbe]' : (Math.random() > 0.9 ? 'bg-[#a8a0ff]' : 'bg-white'),
      delay: `${Math.random() * 4}s`
    }));
  }, []);

  return (
    <div className="bg-[#0d071d] text-white selection:bg-pink-500 selection:text-white overflow-x-hidden w-full relative">

      {/* Global Background Stars */}
      <motion.div style={{ y: yStars }} className="absolute inset-0 pointer-events-none z-0">
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
      </motion.div>

      {/* --- PAGE 1: HERO SECTION --- */}
      <div className="min-h-screen flex flex-col relative overflow-hidden">

        {/* Deep Background Clouds (Middle 40%) */}
        <motion.div style={{ y: yClouds }} className="absolute inset-x-0 top-[30%] bottom-[10%] pointer-events-none z-0 flex items-center justify-center">
          <img src="/bgclouds2.webp" alt="Background Clouds" className="w-full h-full object-cover opacity-60" style={{ imageRendering: 'pixelated' }} />
        </motion.div>

        {/* Background Clouds */}
        <motion.img src="/cloud2.webp" alt="" className="absolute top-[12%] xl:top-[20%] -left-4 xl:left-8 w-40 md:w-56 xl:w-72 pointer-events-none z-0" style={{ y: yClouds, imageRendering: 'pixelated' }} />
        <motion.img src="/cloud1.webp" alt="" className="absolute top-[30%] xl:top-[10%] -right-4 xl:right-8 w-48 md:w-64 xl:w-80 pointer-events-none z-0" style={{ y: yClouds, imageRendering: 'pixelated' }} />

        {/* Hero Section Center Image */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]">
          <img src="/herosectionimage-removebg-preview.webp" alt="Hero Background" className="w-[100vw] xl:w-[900px] 2xl:w-[1100px] max-w-none h-auto object-contain opacity-90" style={{ imageRendering: 'pixelated' }} />
        </div>

        {/* Navbar */}
        <header className="flex justify-between items-center p-3 xl:p-6 z-50 relative">
          <div className="flex items-center gap-3 relative z-50">
            <img src="/acm-logo.webp" alt="ACM Logo" className="w-12 h-12 md:w-13 xl:w-14 xl:h-14" style={{ imageRendering: 'auto' }} />
            <img src="/logoacnsnioe.webp" alt="ACM SNIOE Logo" className="h-10 md:h-14 xl:h-16 w-auto pointer-events-none" style={{ imageRendering: 'pixelated' }} />
          </div>

          {/* Right Side: Navigation & Actions */}
          <div className="flex items-center gap-2 md:gap-4 xl:gap-6 relative z-50">
            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-4 xl:gap-6 font-vt323 text-xl md:text-2xl xl:tracking-wider">
              <Link to="/" className="text-[#ff5ea6] underline underline-offset-4 decoration-2 font-bold">Home</Link>
              <a href="#about" className="hover:underline underline-offset-4 decoration-2">About</a>
              <Link to="/events" className="hover:underline underline-offset-4 decoration-2">Events</Link>
              <a href="#team" className="hover:underline underline-offset-4 decoration-2">Team</a>
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

          {/* Mobile Nav Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-full left-0 right-0 bg-[#1a0f30]/95 backdrop-blur-md border-b border-[#ff5ea6]/30 p-6 flex flex-col items-center gap-6 font-vt323 text-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-40 md:hidden"
              >
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-[#ff5ea6] underline underline-offset-4 decoration-2 font-bold">Home</Link>
                <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#ff8cbe]">About</a>
                <Link to="/events" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#ff8cbe]">Events</Link>
                <a href="#team" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-[#ff8cbe]">Team</a>
                <Link to="/games" onClick={() => setIsMobileMenuOpen(false)} className="text-[#a8a0ff] hover:text-[#ff5ea6]">Games</Link>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-start text-center px-4 z-10 w-full max-w-5xl mx-auto pb-32 xl:pb-28">

          {/* Title */}
          <div className="mb-2 select-none pt-16 xl:pt-0 flex flex-col items-center">
            <img src="/acmsnioe.webp" alt="ACM SNIOE Title" className="w-[300px] md:w-[380px] xl:w-[480px] h-auto mb-2 pointer-events-none" style={{ imageRendering: 'pixelated' }} />
          </div>

          {/* Spacer that pushes content to bottom on tablets/phones, acts as fixed height on laptops */}
          <div className="w-full flex-1 xl:flex-none xl:h-48 pointer-events-none"></div>

          <div className="flex flex-col items-center w-full mt-auto z-10">
            {/* White Pill Button (Everybody's) - Tilted slightly */}
            <div className="relative inline-flex items-center justify-center -rotate-[2deg] mb-1 cursor-pointer">
              <img src="/white.webp" alt="Everybody's Pill bg" className="w-[260px] md:w-[340px] xl:w-[420px] h-auto pointer-events-none" style={{ imageRendering: 'pixelated' }} />
              <span className="absolute font-pixelify text-black text-2xl md:text-4xl xl:text-5xl tracking-tight -mt-1 md:-mt-2 font-bold drop-shadow-[1px_1px_0_rgba(0,0,0,0.2)]">Everybody's</span>
            </div>

            <h3 className="text-[#ff5ea6] font-pixelify text-3xl md:text-4xl xl:text-5xl mb-3 drop-shadow-[3px_3px_0_rgba(0,0,0,0.8)]">
              Invited.
            </h3>

            {/* Thin/Light text */}
            <p className="font-vt323 font-light text-base xl:text-xl max-w-xl leading-snug mb-5 text-gray-300 opacity-90 px-2">
              Empowering students to innovate, build, and <br className="hidden xl:block" />
              lead the future of technology through collaborative <br className="hidden xl:block" />
              learning and real-world projects.
            </p>

            {/* Action Buttons using individual images */}
            <div className="flex flex-wrap gap-4 justify-center w-full">
              <Link to="/events" className="relative inline-flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform">
                <img src="/pink.webp" alt="Pink button bg" className="w-[160px] md:w-[200px] xl:w-[240px] h-auto pointer-events-none" style={{ imageRendering: 'pixelated' }} />
                <span className="absolute font-silkscreen text-black text-sm xl:text-lg pb-1.5 md:pb-2 pointer-events-none uppercase">EXPLORE EVENTS</span>
              </Link>

              <a href="#team" className="relative inline-flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform">
                <img src="/purple.webp" alt="Purple button bg" className="w-[160px] md:w-[200px] xl:w-[240px] h-auto pointer-events-none" style={{ imageRendering: 'pixelated' }} />
                <span className="absolute font-silkscreen text-black text-sm xl:text-lg pb-1.5 md:pb-2 pointer-events-none uppercase">MEET THE TEAM</span>
              </a>
            </div>
          </div>
        </main>

        {/* Boombox on Left of Footer */}
        <img src="/boombox.webp" alt="Boombox" onClick={() => navigate('/games/pacman')} className="absolute left-2 xl:left-5 bottom-[2.9rem] md:bottom-[2.6rem] lg:landscape:bottom-[2.3rem] xl:landscape:bottom-[3.8rem] 2xl:landscape:bottom-[3.3rem] w-20 md:w-32 xl:w-52 -rotate-[1.5deg] z-30 cursor-pointer origin-bottom hover:scale-105 hover:brightness-125 hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all" style={{ imageRendering: 'pixelated' }} />
        {/* Gengar Standing on Footer */}
        <img src="/gengar.webp" alt="Gengar" onClick={() => navigate('/games/reaction')} className="absolute right-2 xl:right-6 bottom-[3.2rem] md:bottom-[3.4rem] lg:landscape:bottom-[3.6rem] xl:landscape:bottom-[5.2rem] 2xl:landscape:bottom-[5.7rem] w-20 md:w-32 xl:w-48 -rotate-[5.5deg] z-30 cursor-pointer origin-bottom hover:scale-105 hover:brightness-125 hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all" style={{ imageRendering: 'pixelated' }} />

        {/* Tilted Footer Ticker */}
        <footer className="absolute bottom-2 md:bottom-3 xl:bottom-7 -left-4 w-[110vw] -rotate-[1.5deg] bg-[#1a0f30] border-y-2 border-[#ff8cbe] py-2 xl:py-3 overflow-hidden whitespace-nowrap z-20 font-vt323 text-base xl:text-lg text-gray-300 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <div className="animate-[marquee_30s_linear_infinite] inline-block">
            <span className="text-[#ff8cbe] font-silkscreen mx-4">ACM SNIOE</span>
            Empowering students to innovate, build, and lead the future of technology through collaborative learning and real-world projects.
            <span className="text-[#ff8cbe] font-silkscreen mx-4">ACM SNIOE</span>
            Empowering students to innovate, build, and lead the future of technology through collaborative learning and real-world projects.
            <span className="text-[#ff8cbe] font-silkscreen mx-4">ACM SNIOE</span>
            Empowering students to innovate, build, and lead the future of technology through collaborative learning and real-world projects.
          </div>
        </footer>

        <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); -webkit-transform: translateX(0); }
          100% { transform: translateX(-50%); -webkit-transform: translateX(-50%); }
        }
        @-webkit-keyframes marquee {
          0% { -webkit-transform: translateX(0); }
          100% { -webkit-transform: translateX(-50%); }
        }
        .marquee-track {
          will-change: transform;
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
        }
      `}</style>
      </div>

      {/* --- PAGE 2: ABOUT US --- */}
      <div id="about" ref={aboutRef} className="flex flex-col relative overflow-hidden items-center justify-start text-center pt-16 md:pt-28 px-4 pb-0">

        {/* Heading Area */}
        <motion.div
          style={{ scale: scaleHeading, y: yHeading, opacity: opacityHeading }}
          className="mb-12 flex justify-center"
        >
          <h2 className="font-pixelify text-4xl md:text-5xl xl:text-6xl text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] leading-tight m-0 flex items-center gap-4">
            {/* Decorative Rolled Paper */}
            <motion.img
              src="/rolledpaper.webp"
              alt="Rolled Paper"
              style={{ imageRendering: 'pixelated' }}
              className="h-[1em] w-auto hover:scale-110 transition-transform duration-300 cursor-pointer z-10"
            />
            <span>About <span className="text-[#ff5ea6]">Us.</span></span>
          </h2>
        </motion.div>

        {/* Paragraphs Container */}
        <div className="flex flex-col gap-6 max-w-4xl z-10 relative text-center">

          <motion.div style={{ opacity: fadeOutParas }} className="flex flex-col gap-6 relative">

            {/* Flying Pokeball */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
              className="hidden xl:block absolute -right-4 xl:-right-18 top-10 xl:top-20 z-30 pointer-events-none"
            >
              <motion.img
                animate={{ y: [0, -15, 0], rotate: [0, 20, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                src="/pokeball.webp"
                alt="Pokeball"
                className="w-16 xl:w-20 h-auto drop-shadow-[2px_4px_6px_rgba(0,0,0,0.6)]"
                style={{ imageRendering: 'pixelated' }}
              />
            </motion.div>

            {/* Evee Image (Right Middle) */}
            <motion.img
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 1, delay: 0.6 }}
              whileHover={{ scale: 1.1 }}
              src="/evee.webp"
              alt="Evee"
              className="hidden lg:block absolute -right-24 lg:-right-21 xl:-right-50 top-1/2 -translate-y-1/2 w-32 xl:w-48 h-auto z-20 cursor-pointer"
              style={{ imageRendering: 'pixelated' }}
            />

            <SplitText
              text="The ACM Student Chapter at Shiv Nadar Institution of Eminence (SNIoE) is the official computer science society dedicated to building a strong technical culture on campus. Affiliated with the global Association for Computing Machinery, the chapter bridges the gap between academic learning and real-world application by offering hands-on experience through workshops, competitions, and collaborative projects."
              className="font-vt323 font-light text-lg md:text-2xl text-gray-300 leading-relaxed opacity-90"
              delay={0.1}
            />

            <SplitText
              text="Operating across five key domains—Competitive Programming, Web Development, Data Analytics, Artificial Intelligence & Machine Learning, and Cybersecurity—ACM SNIOE provides students with opportunities to develop practical skills, explore diverse interests, and engage in problem-solving. Driven by a commitment to curiosity, inclusivity, and growth, the chapter fosters a community where students learn, innovate, and connect with industry, research, and wider computing ecosystems."
              className="font-vt323 font-light text-lg md:text-2xl text-gray-300 leading-relaxed opacity-90 mb-8"
              delay={0.5}
            />
          </motion.div>

          {/* Mission Section */}
          <motion.div style={{ opacity: fadeOutMission }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="bg-[#1a0f30]/60 border-l-4 border-[#ff5ea6] p-6 md:p-8 rounded-r-xl text-left shadow-[0_0_30px_rgba(255,94,166,0.15)] mx-auto max-w-3xl transform hover:scale-[1.02] transition-transform"
            >
              <h3 className="font-pixelify text-2xl md:text-3xl text-white mb-4 drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)] flex items-center gap-3">
                Our Mission
                <img src="/usb.webp" alt="USB" className="w-8 md:w-12 h-auto" style={{ imageRendering: 'pixelated' }} />
              </h3>
              <p className="font-vt323 text-xl md:text-2xl text-[#ff8cbe] leading-snug italic drop-shadow-[1px_1px_0_rgba(0,0,0,0.5)]">
                "To advance computing as a science and profession by empowering students with knowledge, resources, and connections to shape the technological landscape of tomorrow."
              </p>
            </motion.div>

            {/* Down Arrows */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col items-center mt-6 md:mt-12 mb-0"
            >
              <img src="/arrows.webp" alt="Scroll Down" className="w-24 md:w-40 h-auto animate-bounce opacity-90 pb-2" style={{ imageRendering: 'pixelated' }} />
            </motion.div>

          </motion.div>

        </div>
      </div>

      {/* --- PAGE 3: NEW SECTION --- */}
      <div id="events" className="min-h-screen flex flex-col relative overflow-hidden items-center justify-start text-center pt-2 px-4 pb-4">

        {/* Background Ground Blocks */}
        <div className="absolute bottom-[22vh] md:bottom-[21rem] lg:bottom-[32.5rem] lg:landscape:bottom-[12vh] xl:bottom-[11.25rem] xl:landscape:bottom-[11.25rem] inset-x-0 w-full h-[30vh] md:h-[30vh] lg:landscape:h-[40vh] xl:h-[50vh] xl:landscape:h-[50vh] pointer-events-none z-0 flex items-end">
          <img src="/bgblocks.webp" alt="Ground blocks" className="w-full h-full object-cover object-top opacity-100" style={{ imageRendering: 'pixelated' }} />
        </div>

        {/* Global Clouds for Page 3 */}
        <motion.img src="/cloud2.webp" alt="Cloud" className="absolute left-4 xl:left-12 top-18 xl:top-20 w-24 md:w-40 xl:w-60 opacity-90 pointer-events-none z-0" style={{ imageRendering: 'pixelated' }} />
        <motion.img src="/cloud1.webp" alt="Cloud" className="absolute right-0 xl:right-12 bottom-[7vh] sm:bottom-[20vh] md:bottom-[26vh] lg:bottom-[36vh] xl:bottom-[75vh] w-32 md:w-48 xl:w-56 opacity-90 pointer-events-none z-0" style={{ imageRendering: 'pixelated' }} />

        {/* Heading Area */}
        <div className="z-10 mt-0 mb-1 pt-6 md:pt-10 xl:pt-0">
          <h2 className="font-pixelify text-3xl md:text-5xl xl:text-6xl text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] leading-none mb-1">
            Featured Events
          </h2>
          <h2 className="font-pixelify text-2xl md:text-4xl xl:text-5xl pb-2 text-[#ff5ea6] drop-shadow-[3px_3px_0_rgba(0,0,0,0.8)] leading-none">
            Join The Raid!
          </h2>
        </div>

        {/* Subtitle */}
        <p className="font-vt323 text-base md:text-xl xl:text-xl text-gray-400 max-w-2xl mb-4 xl:mb-2 z-10 leading-snug drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)]">
          Embark On Epic Quests And Secure Legendary Loot! Join Fellow Adventurers<br className="hidden xl:block" /> In Our Upcoming Hackathons, Workshops, And Tech Battles.
        </p>

        {/* Central Parchment Container */}
        <div className="relative w-[105vw] max-w-[105vw] md:w-[105vw] md:max-w-[105vw] xl:w-full xl:max-w-[1500px] flex items-center justify-center z-10 -mt-[5.5rem] md:-mt-[5.5rem] xl:mt-[-8rem] mb-0 xl:mb-[-6rem]">
          <img src="/parchment.webp" alt="Parchment Board" className="w-full h-[650px] md:h-[750px] xl:h-auto object-fill xl:object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]" style={{ imageRendering: 'pixelated' }} />

          {/* --- Content inside parchment (Mobile & iPad) --- */}
          <div
            className="absolute top-[22%] bottom-[25%] left-[17%] right-[17%] overflow-hidden pointer-events-auto xl:hidden"
            onTouchStart={(e) => {
              window.touchStartX = e.changedTouches[0].screenX;
            }}
            onTouchEnd={(e) => {
              const touchEndX = e.changedTouches[0].screenX;
              if (window.touchStartX - touchEndX > 50) handleNextEvent(); // Swipe left
              if (window.touchStartX - touchEndX < -50) handlePrevEvent(); // Swipe right
            }}
          >
            <AnimatePresence>
              <motion.div
                key={currentEventIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col items-center justify-start gap-3 md:gap-6 w-full h-full overflow-y-auto custom-scrollbar pb-4 pt-2"
              >

                {/* Left Column: Title & Image */}
                <div className="flex flex-col items-center flex-1 max-w-md w-full shrink-0">
                  <h3 className="font-pixelify text-2xl md:text-5xl text-[#3b2d1d] drop-shadow-[1px_1px_0_rgba(255,255,255,0.8)] mb-2 text-center pb-1">
                    {currentEvent.title}
                  </h3>
                  <div className="w-[85%] md:w-[94%] xl:w-full rounded-xl overflow-hidden border-[4px] border-[#3b2d1d] shadow-[4px_4px_0_rgba(59,45,29,0.8)] pointer-events-none">
                    <img src={currentEvent.image_url || currentEvent.image || "/eventplaceholder.webp"} alt={currentEvent.title} className="w-full h-auto object-cover" />
                  </div>
                </div>

                {/* Right Column: Description & Details */}
                <div className="flex flex-col flex-1 text-[#3b2d1d] items-center w-full">
                  <div className="bg-[#3b2d1d]/5 rounded-xl p-3 md:p-6 border-2 border-[#3b2d1d]/20 mb-3 md:mb-6 w-full shadow-inner">
                    <p className="font-vt323 text-sm md:text-2xl leading-snug text-center text-[#3b2d1d]/90 font-bold">
                      {currentEvent.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 font-vt323 text-base md:text-3xl text-[#3b2d1d]/80 font-bold justify-center w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-lg md:text-2xl drop-shadow-[1px_1px_0_rgba(255,255,255,0.5)]">🗓️</span> {currentEvent.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg md:text-2xl drop-shadow-[1px_1px_0_rgba(255,255,255,0.5)]">📍</span> {currentEvent.location}
                    </div>
                  </div>

                  {/* Pagination Arrows */}
                  {featuredEvents.length > 1 && (
                    <div className="flex flex-col items-center w-full mt-4">
                      <div className="flex justify-center gap-2">
                        <img onClick={handlePrevEvent} src="/arrow_0.webp" alt="Previous Event" className="h-10 md:h-16 w-auto cursor-pointer hover:scale-110 active:scale-95 transition-transform drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)]" style={{ imageRendering: 'pixelated' }} />
                        <img onClick={handleNextEvent} src="/arrow_1.webp" alt="Next Event" className="h-10 md:h-16 w-auto cursor-pointer hover:scale-110 active:scale-95 transition-transform drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)]" style={{ imageRendering: 'pixelated' }} />
                      </div>
                      <span className="font-vt323 text-xs md:text-lg text-[#3b2d1d]/60 mt-1 uppercase tracking-wider">Swipe or click</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* --- Content inside parchment (Laptop Only) --- */}
          <div className="hidden xl:block absolute inset-0 pointer-events-auto overflow-hidden">
            <AnimatePresence>
              <motion.div
                key={currentEventIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 2xl:gap-4 px-[24%] 2xl:px-[18%] pb-[1%] w-full h-full"
              >

                {/* Title spanning full width */}
                <div className="flex items-center justify-center w-full h-[5rem] 2xl:h-[5.5rem] shrink-0">
                  <h3 className="font-pixelify text-4xl 2xl:text-5xl text-[#3b2d1d] drop-shadow-[1px_1px_0_rgba(255,255,255,0.8)] text-center w-full">
                    {currentEvent.title}
                  </h3>
                </div>

                {/* Image and Description Side-by-Side */}
                <div className="flex flex-row gap-6 2xl:gap-12 w-full items-start mt-2">
                  {/* Left Column: Image */}
                  <div className="w-[45%] flex justify-center h-[20rem] 2xl:h-[24rem] shrink-0">
                    <div className="w-full h-full rounded-xl overflow-hidden border-[4px] border-[#3b2d1d] shadow-[4px_4px_0_rgba(59,45,29,0.8)]">
                      <img src={currentEvent.image_url || currentEvent.image || "/eventplaceholder.webp"} alt={currentEvent.title} className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* Right Column: Description & Details */}
                  <div className="w-[51%] flex flex-col text-[#3b2d1d] items-start h-[20rem] 2xl:h-[26rem] justify-between shrink-0">
                    <div className="bg-[#3b2d1d]/5 rounded-xl p-4 2xl:p-6 border-2 border-[#3b2d1d]/20 w-full shadow-inner flex-1 overflow-y-auto custom-scrollbar mb-4 2xl:mb-6">
                      <p className="font-vt323 text-2xl 2xl:text-2xl leading-snug text-left text-[#3b2d1d]/90 font-bold">
                        {currentEvent.description}
                      </p>
                    </div>

                    <div className="flex flex-col w-full shrink-0">
                      <div className="flex flex-row gap-4 2xl:gap-8 font-vt323 text-2xl 2xl:text-3xl text-[#3b2d1d]/80 font-bold self-start w-full">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl 2xl:text-2xl drop-shadow-[1px_1px_0_rgba(255,255,255,0.5)]">🗓️</span> {currentEvent.date}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl 2xl:text-2xl drop-shadow-[1px_1px_0_rgba(255,255,255,0.5)]">📍</span> {currentEvent.location}
                        </div>
                      </div>

                      {/* Pagination Arrows */}
                      {featuredEvents.length > 1 && (
                        <div className="flex justify-end w-full mt-2 gap-0 pr-8 2xl:pr-0">
                          <img onClick={handlePrevEvent} src="/arrow_0.webp" alt="Previous Event" className="h-12 2xl:h-16 w-auto cursor-pointer hover:scale-110 active:scale-95 transition-transform drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)]" style={{ imageRendering: 'pixelated' }} />
                          <img onClick={handleNextEvent} src="/arrow_1.webp" alt="Next Event" className="h-12 2xl:h-16 w-auto cursor-pointer hover:scale-110 active:scale-95 transition-transform drop-shadow-[2px_2px_0_rgba(0,0,0,0.2)]" style={{ imageRendering: 'pixelated' }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Nezuko Decor */}
          <motion.img
            src="/nezuko.webp"
            alt="Nezuko"
            className="absolute right-1 md:right-4 xl:right-15 bottom-16 xl:bottom-30 w-24 md:w-40 xl:w-[14rem] h-auto drop-shadow-[2px_2px_10px_rgba(0,0,0,0.8)] z-20 pointer-events-none origin-bottom"
            style={{ imageRendering: 'pixelated' }}
            animate={{
              y: [0, -2, 0],
              rotate: [0, 1, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Action Button */}
        <div className="z-30 -mt-[6.5rem] md:-mt-32 xl:-mt-24 mb-4 xl:mb-8 flex flex-col items-center -rotate-[3deg]">
          <Link to="/events" className="relative inline-flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200">
            <img src="/viewquest.webp" alt="View Quests Button" className="w-[200px] md:w-[300px] xl:w-[360px] h-auto pointer-events-none" style={{ imageRendering: 'pixelated' }} />
          </Link>
          <p className="font-vt323 text-lg md:text-3xl xl:text-4xl text-[#ff5ea6] drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)] text-center pl-2 xl:pl-6 -mt-2 xl:-mt-6">
            Assemble Your Party.
          </p>
        </div>
        
      </div>

      {/* --- PAGE 4: MEET THE TEAM --- */}
      <div id="team" className="flex flex-col relative overflow-hidden items-center justify-start text-center pt-24 md:pt-32 px-4 pb-12 z-20 -mt-[2rem] sm:-mt-[12rem] md:portrait:-mt-[20rem] lg:landscape:-mt-[5rem] xl:mt-0">

        {/* Background Overlay */}
        <div className="absolute inset-0 pointer-events-none z-0"></div>

        <div className="z-10 w-full max-w-7xl mx-auto flex flex-col items-center">
        
          {/* --- MENTORS OF THE GUILD --- */}
          {facultyMembers && facultyMembers.length > 0 && (
            <div className="mb-20 md:mb-24 flex flex-col items-center w-full">
              <h2 className="font-pixelify text-4xl md:text-5xl xl:text-6xl text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] mb-8 md:mb-12 text-center uppercase tracking-wider leading-snug">
                Mentors of <br className="md:hidden" /><span className="text-[#ff5ea6]">The Guild</span>
              </h2>
              <div className="w-full flex justify-center rotate-[-3deg] transition-transform duration-500 scale-105 pr-2 md:pr-0">
                <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center max-w-5xl gap-x-2 gap-y-12 md:gap-8 p-0">
                  {facultyMembers.map((member, idx) => (
                    <div
                      key={idx}
                      className="relative flex flex-col items-center group cursor-pointer hover:scale-125 hover:z-50 transition-all duration-300"
                      onClick={() => setSelectedMember(member)}
                    >
                      <div className="relative w-40 h-40 md:w-56 md:h-56">
                        <img src="/character_grid.webp" alt="Grid Tile" className="absolute inset-0 w-full h-full object-fill pointer-events-none drop-shadow-lg" style={{ imageRendering: 'pixelated' }} />
                        <div className="absolute inset-[6%] rounded-lg overflow-hidden flex items-center justify-center bg-black/40">
                          <img src={member.image_url || `https://api.dicebear.com/9.x/pixel-art/svg?seed=${member.name}`} alt={member.name} className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div className="text-center mt-3 rotate-[3deg] w-42 sm:w-44 md:w-64">
                        <h4 className="font-pixelify text-lg sm:text-xl md:text-3xl text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)] leading-tight">{member.name}</h4>
                        <p className="font-vt323 text-base sm:text-lg md:text-2xl text-[#ff8cbe] drop-shadow-[1px_1px_0_rgba(0,0,0,1)] mt-1 leading-tight">{member.position}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <h2 className="font-pixelify text-4xl md:text-5xl xl:text-6xl text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] mb-10 md:mb-16 text-center uppercase tracking-wider">
            Meet <span className="text-[#ff5ea6]">The Guild</span>
          </h2>

          {/* Angled Core Section */}
          <div className="w-full flex justify-center mb-28 md:mb-24 rotate-[-3deg] transition-transform duration-500 scale-105 pr-2 md:pr-0">
            <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center max-w-5xl gap-x-2 gap-y-12 md:gap-8 p-0">
              {coreMembers.map((member, idx) => (
                <div
                  key={idx}
                  className="relative flex flex-col items-center group cursor-pointer hover:scale-125 hover:z-50 transition-all duration-300"
                  onClick={() => setSelectedMember(member)}
                >
                  <div className="relative w-40 h-40 md:w-56 md:h-56">
                    <img src="/character_grid.webp" alt="Grid Tile" className="absolute inset-0 w-full h-full object-fill pointer-events-none drop-shadow-lg" style={{ imageRendering: 'pixelated' }} />
                    <div className="absolute inset-[6%] rounded-lg overflow-hidden flex items-center justify-center">
                      <img src={member.image_url || `https://api.dicebear.com/9.x/pixel-art/svg?seed=${member.name}`} alt={member.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="text-center mt-3 rotate-[3deg] w-42 sm:w-44 md:w-64">
                    <h4 className="font-pixelify text-lg sm:text-xl md:text-3xl text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)] leading-tight">{member.name}</h4>
                    <p className="font-vt323 text-base sm:text-lg md:text-2xl text-[#ff8cbe] drop-shadow-[1px_1px_0_rgba(0,0,0,1)] mt-1 leading-tight">{member.position}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <h3 className="font-pixelify text-3xl md:text-5xl text-white mb-2 md:mb-4 drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] uppercase">
            Party Members
          </h3>
          <p className="font-vt323 text-lg md:text-2xl text-[#ff8cbe] drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)] mb-8 md:mb-12 animate-pulse cursor-default">
            Click to inspect member stats!
          </p>

          {/* Marquee Subcore Section */}
          <div className="w-[110vw] md:w-[120vw] relative rotate-[-4deg] flex flex-col items-center scale-105 mb-0 pb-28 lg:pb-36 overflow-hidden">

            {/* ---- MOBILE VIEW (3 Rows) ---- */}
            <div className="flex md:hidden flex-col items-center w-full mt-4">
              {/* Mobile Row 1 */}
              <div data-speed="0.3" className="mobile-marquee marquee-track relative z-10 hover:z-50 flex flex-nowrap w-full hover:[animation-play-state:paused] mb-3 pb-4 px-10">
                {[...subcoreMembers.slice(0, 4), ...subcoreMembers.slice(0, 4), ...subcoreMembers.slice(0, 4), ...subcoreMembers.slice(0, 4)].map((member, idx) => (
                  <div
                    key={idx}
                    className="relative inline-flex flex-col items-center group cursor-pointer mx-2 shrink-0 hover:scale-125 hover:z-50 transition-all duration-300"
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="relative w-32 h-32">
                      <img src="/character_grid.webp" alt="Grid Tile" className="absolute inset-0 w-full h-full object-fill pointer-events-none drop-shadow-lg" style={{ imageRendering: 'pixelated' }} />
                      <div className="absolute inset-[6%] rounded-lg overflow-hidden flex items-center justify-center">
                        <img src={member.image_url || `https://api.dicebear.com/9.x/pixel-art/svg?seed=${member.name}`} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="text-center mt-2 opacity-100 z-10 w-36 flex flex-col justify-center min-h-[4rem]">
                      <h4 className="font-pixelify text-lg text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)] leading-tight">{member.name}</h4>
                      <p className="font-vt323 text-base text-[#ff5ea6] drop-shadow-[1px_1px_0_rgba(0,0,0,1)] leading-tight">{member.position}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Row 2 */}
              <div data-speed="-0.3" className="mobile-marquee marquee-track relative z-10 hover:z-50 flex flex-nowrap w-full hover:[animation-play-state:paused] mb-3 pb-4 px-10">
                {[...subcoreMembers.slice(4, 8), ...subcoreMembers.slice(4, 8), ...subcoreMembers.slice(4, 8), ...subcoreMembers.slice(4, 8)].map((member, idx) => (
                  <div
                    key={idx}
                    className="relative inline-flex flex-col items-center group cursor-pointer mx-2 shrink-0 hover:scale-125 hover:z-50 transition-all duration-300"
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="relative w-32 h-32">
                      <img src="/character_grid.webp" alt="Grid Tile" className="absolute inset-0 w-full h-full object-fill pointer-events-none drop-shadow-lg" style={{ imageRendering: 'pixelated' }} />
                      <div className="absolute inset-[6%] rounded-lg overflow-hidden flex items-center justify-center">
                        <img src={member.image_url || `https://api.dicebear.com/9.x/pixel-art/svg?seed=${member.name}`} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="text-center mt-2 opacity-100 z-10 w-36 flex flex-col justify-center min-h-[4rem]">
                      <h4 className="font-pixelify text-lg text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)] leading-tight">{member.name}</h4>
                      <p className="font-vt323 text-base text-[#ff5ea6] drop-shadow-[1px_1px_0_rgba(0,0,0,1)] leading-tight">{member.position}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Row 3 */}
              <div data-speed="0.4" className="mobile-marquee marquee-track relative z-10 hover:z-50 flex flex-nowrap w-full hover:[animation-play-state:paused] pb-4 px-10">
                {[...subcoreMembers.slice(8, 12), ...subcoreMembers.slice(8, 12), ...subcoreMembers.slice(8, 12), ...subcoreMembers.slice(8, 12)].map((member, idx) => (
                  <div
                    key={idx}
                    className="relative inline-flex flex-col items-center group cursor-pointer mx-2 shrink-0 hover:scale-125 hover:z-50 transition-all duration-300"
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="relative w-32 h-32">
                      <img src="/character_grid.webp" alt="Grid Tile" className="absolute inset-0 w-full h-full object-fill pointer-events-none drop-shadow-lg" style={{ imageRendering: 'pixelated' }} />
                      <div className="absolute inset-[6%] rounded-lg overflow-hidden flex items-center justify-center">
                        <img src={member.image_url || `https://api.dicebear.com/9.x/pixel-art/svg?seed=${member.name}`} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="text-center mt-2 opacity-100 z-10 w-36 flex flex-col justify-center min-h-[4rem]">
                      <h4 className="font-pixelify text-lg text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)] leading-tight">{member.name}</h4>
                      <p className="font-vt323 text-base text-[#ff5ea6] drop-shadow-[1px_1px_0_rgba(0,0,0,1)] leading-tight">{member.position}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ---- DESKTOP/TABLET VIEW (2 Rows) ---- */}
            <div className="hidden md:flex flex-col items-center w-full mt-8 lg:mt-16">
              {/* Desktop Row 1 */}
              <div className="marquee-track relative z-10 hover:z-50 flex flex-nowrap w-fit hover:[animation-play-state:paused] mb-8 lg:mb-12" style={{ animation: "marquee 120s linear infinite" }}>
                {[...subcoreMembers.slice(0, 6), ...subcoreMembers.slice(0, 6), ...subcoreMembers.slice(0, 6), ...subcoreMembers.slice(0, 6), ...subcoreMembers.slice(0, 6), ...subcoreMembers.slice(0, 6), ...subcoreMembers.slice(0, 6), ...subcoreMembers.slice(0, 6)].map((member, idx) => (
                  <div
                    key={idx}
                    className="relative inline-flex flex-col items-center group cursor-pointer mx-4 lg:mx-8 shrink-0 hover:scale-125 hover:z-50 transition-all duration-300"
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="relative w-48 h-48 lg:w-56 lg:h-56">
                      <img src="/character_grid.webp" alt="Grid Tile" className="absolute inset-0 w-full h-full object-fill pointer-events-none drop-shadow-lg" style={{ imageRendering: 'pixelated' }} />
                      <div className="absolute inset-[6%] rounded-lg overflow-hidden flex items-center justify-center">
                        <img src={member.image_url || `https://api.dicebear.com/9.x/pixel-art/svg?seed=${member.name}`} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute top-full -mt-2 lg:-mt-4 z-10 w-64 lg:w-80 flex flex-col items-center justify-start min-h-[4rem]">
                      <h4 className="font-pixelify text-2xl lg:text-3xl text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)] leading-tight">{member.name}</h4>
                      <p className="font-vt323 text-xl lg:text-2xl text-[#ff5ea6] drop-shadow-[1px_1px_0_rgba(0,0,0,1)] leading-tight -mt-1 lg:-mt-2">{member.position}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Row 2 */}
              <div className="marquee-track relative z-10 hover:z-50 flex flex-nowrap w-fit hover:[animation-play-state:paused]" style={{ animation: "marquee 110s linear infinite reverse" }}>
                {[...subcoreMembers.slice(6, 12), ...subcoreMembers.slice(6, 12), ...subcoreMembers.slice(6, 12), ...subcoreMembers.slice(6, 12), ...subcoreMembers.slice(6, 12), ...subcoreMembers.slice(6, 12), ...subcoreMembers.slice(6, 12), ...subcoreMembers.slice(6, 12)].map((member, idx) => (
                  <div
                    key={idx}
                    className="relative inline-flex flex-col items-center group cursor-pointer mx-4 lg:mx-8 shrink-0 hover:scale-125 hover:z-50 transition-all duration-300"
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="relative w-48 h-48 lg:w-56 lg:h-56">
                      <img src="/character_grid.webp" alt="Grid Tile" className="absolute inset-0 w-full h-full object-fill pointer-events-none drop-shadow-lg" style={{ imageRendering: 'pixelated' }} />
                      <div className="absolute inset-[6%] rounded-lg overflow-hidden flex items-center justify-center">
                        <img src={member.image_url || `https://api.dicebear.com/9.x/pixel-art/svg?seed=${member.name}`} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute top-full -mt-2 lg:-mt-4 z-10 w-64 lg:w-80 flex flex-col items-center justify-start min-h-[4rem]">
                      <h4 className="font-pixelify text-2xl lg:text-3xl text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)] leading-tight">{member.name}</h4>
                      <p className="font-vt323 text-xl lg:text-2xl text-[#ff5ea6] drop-shadow-[1px_1px_0_rgba(0,0,0,1)] leading-tight -mt-1 lg:-mt-2">{member.position}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>


      </div>

      {/* --- PAGE 5: FOOTER SECTION --- */}
      <div className="min-h-screen relative flex flex-col items-center justify-between pt-16 md:pt-24 pb-12 text-white z-20 overflow-hidden">

        {/* Background Ground Blocks */}
        <div className="absolute bottom-0 w-full h-[5vh] md:h-[6vh] xl:h-[7vh] z-40 pointer-events-none">
          <img src="/bgblocks.webp" alt="Ground blocks" className="w-full h-full object-cover object-top opacity-100" style={{ imageRendering: 'pixelated' }} />
        </div>

        {/* Deep Background Clouds */}
        <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-40">
          <img src="/bgclouds2.webp" alt="Background Clouds" className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
        </div>

        {/* Foreground Clouds */}
        <motion.img
          initial={{ x: -50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 0.8 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="/cloud1.webp" alt="Cloud" className="absolute top-[15%] -left-10 md:left-6 w-40 md:w-72 pointer-events-none z-0" style={{ imageRendering: 'pixelated' }}
        />
        <motion.img
          initial={{ x: 50, opacity: 0 }}
          whileInView={{ x: 0, opacity: 0.8 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
          src="/cloud2.webp" alt="Cloud" className="absolute top-[50%] -right-10 md:right-20 w-48 md:w-80 pointer-events-none z-0" style={{ imageRendering: 'pixelated' }}
        />

        {/* Top: GAME OVER */}
        <motion.div
          initial={{ opacity: 0, scale: 1.1, y: -20 }}
          whileInView={{ opacity: 0.2, scale: 1, y: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="z-0 absolute top-16 md:top-20 flex flex-col items-center w-full pointer-events-none"
        >
          <h1 className="font-pixelify text-[7.5rem] md:text-[15rem] text-white tracking-widest leading-[0.8] text-center drop-shadow-none">
            GAME<br />OVER
          </h1>
        </motion.div>

        {/* Moon and Clouds (Behind Logo and Text) */}
        <div className="absolute top-[40%] md:top-[61%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[5]">
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 0.8, scale: 1 }}
            animate={{ y: [0, -10, 0] }}
            transition={{
              opacity: { duration: 2, delay: 1 },
              scale: { duration: 2, delay: 1 },
              y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
            }}
            src="/moon_and_clouds.webp" alt="Moon and Clouds" className="w-[120px] md:w-[300px] h-auto" style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Middle: ACM SNIOE Logo */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, type: "spring" }}
          className="z-10 mt-36 md:mt-42 mb-12 flex-1 flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-6 relative z-10">
            <img src="/acmsnioe.webp" alt="ACM SNIOE Logo" className="w-[300px] md:w-[600px] h-auto pointer-events-none drop-shadow-[0_0_30px_rgba(255,140,190,0.2)] hover:scale-105 transition-transform duration-500" style={{ imageRendering: 'pixelated' }} />
          </div>
        </motion.div>

        {/* Bottom: Want to Join Us? & Links */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="z-10 flex flex-col items-center w-full max-w-5xl px-4 mt-20 md:mt-auto"
        >
          <h2 className="font-pixelify text-4xl md:text-5xl mb-5 text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)] text-center">
            Want to <span className="text-[#ff5ea6]">join us?</span>
          </h2>

          <div className="flex flex-col md:flex-row gap-8 md:gap-32 font-vt323 text-2xl md:text-3xl text-gray-300 drop-shadow-[1px_1px_0_rgba(0,0,0,0.8)] mb-8">

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="flex flex-col items-center gap-3"
            >
              <span className="text-white font-bold tracking-widest border-b-4 border-[#ff5ea6] pb-1 mb-2 px-2">CONTACT</span>
              <a href="mailto:acm@snu.edu.in" className="hover:text-[#ff5ea6] hover:scale-105 transition-all">acm@snu.edu.in</a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
              className="flex flex-col items-center gap-3"
            >
              <span className="text-white font-bold tracking-widest border-b-4 border-[#ff5ea6] pb-1 mb-2 px-2">SOCIALS</span>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-center">
                <a href="https://github.com/acmsnu" target="_blank" rel="noreferrer" className="hover:text-[#ff5ea6] hover:scale-105 transition-all flex items-center gap-2">
                  GitHub
                </a>
                <span className="hidden sm:block text-[#ff5ea6] opacity-50">•</span>
                <a href="https://www.linkedin.com/company/acm-snu/" target="_blank" rel="noreferrer" className="hover:text-[#ff5ea6] hover:scale-105 transition-all flex items-center gap-2">
                  LinkedIn
                </a>
                <span className="hidden sm:block text-[#ff5ea6] opacity-50">•</span>
                <a href="https://www.instagram.com/acmsnu?igsh=NmxmM2E5eXg3Mm5o" target="_blank" rel="noreferrer" className="hover:text-[#ff5ea6] hover:scale-105 transition-all flex items-center gap-2">
                  Instagram
                </a>
              </div>
            </motion.div>

          </div>

          <p className="font-vt323 text-gray-500 mt-4 mb-4 md:mb-6 text-xl tracking-widest">
            © 2026 ACM SNIoE Student Chapter
          </p>
        </motion.div>

        {/* Flying GIF (Right Bottom Corner) */}
        <motion.img
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.8, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.8, type: "spring" }}
          src="/flying.gif"
          alt="Flying Character"
          className="absolute right-0 md:right-8 bottom-10 md:bottom-[3rem] w-16 md:w-40 z-[25] pointer-events-none drop-shadow-[2px_2px_5px_rgba(0,0,0,0.5)]"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Straight Footer Ticker (Absolute at Bottom) */}
        <div className="absolute bottom-0 left-0 w-full bg-[#1a0f30] border-t-2 border-[#ff8cbe] py-2 md:py-3 overflow-hidden whitespace-nowrap z-20 font-vt323 text-base md:text-lg text-gray-300 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
          <div className="animate-[marquee_30s_linear_infinite] inline-block">
            <span className="text-[#ff8cbe] font-silkscreen mx-4">ACM SNIOE</span>
            Empowering students to innovate, build, and lead the future of technology through collaborative learning and real-world projects.
            <span className="text-[#ff8cbe] font-silkscreen mx-4">ACM SNIOE</span>
            Empowering students to innovate, build, and lead the future of technology through collaborative learning and real-world projects.
            <span className="text-[#ff8cbe] font-silkscreen mx-4">ACM SNIOE</span>
            Empowering students to innovate, build, and lead the future of technology through collaborative learning and real-world projects.
          </div>
        </div>
      </div>

      {/* Member Popup Modal */}
      <AnimatePresence>
        {selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedMember(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              className="bg-[#080315] border-4 border-[#ff5ea6] p-6 md:p-8 rounded-xl relative max-w-sm md:max-w-md w-full flex flex-col items-center shadow-[0_0_30px_rgba(255,94,166,0.5)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-4 text-[#ff8cbe] hover:text-white font-pixelify text-3xl transition-colors"
                onClick={() => setSelectedMember(null)}
              >
                ×
              </button>

              <div className="relative w-72 h-72 sm:w-[22rem] sm:h-[22rem] mb-6 mt-4">
                <img src="/character_grid.webp" alt="Grid Tile" className="absolute inset-0 w-full h-full object-fill pointer-events-none drop-shadow-lg" style={{ imageRendering: 'pixelated' }} />
                <div className="absolute inset-[6%] rounded-lg overflow-hidden flex items-center justify-center">
                  <img src={selectedMember.image_url || `https://api.dicebear.com/9.x/pixel-art/svg?seed=${selectedMember.name}`} alt={selectedMember.name} className="w-full h-full object-cover" />
                </div>
              </div>

              <h4 className="font-pixelify text-3xl sm:text-4xl text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)] text-center leading-tight mb-2">
                {selectedMember.name}
              </h4>
              <p className="font-vt323 text-2xl sm:text-3xl text-[#ff5ea6] drop-shadow-[1px_1px_0_rgba(0,0,0,1)] text-center leading-tight">
                {selectedMember.position}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Component is exported inline now
