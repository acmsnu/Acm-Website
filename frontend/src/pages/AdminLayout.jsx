import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getAuthToken, API_BASE_URL, fetchWithAuth } from '../utils/api';
import { Users, Calendar, LogOut, Menu, X } from 'lucide-react';
import StarrySky from '../components/StarrySky';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        navigate('/admin/login');
        return;
      }

      try {
        const res = await fetchWithAuth('/auth/verify');
        if (!res.ok) {
          navigate('/admin/login');
        } else {
          setIsVerifying(false);
        }
      } catch (err) {
        console.error('Failed to verify token:', err);
        navigate('/admin/login');
      }
    };

    checkAuth();
  }, [navigate]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  if (isVerifying) {
    return <div className="min-h-screen bg-[#0d071d] text-white flex items-center justify-center font-vt323 text-3xl">Verifying Access...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0d071d] text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#1a0f30] border-b-2 border-[#ff8cbe] z-40">
        <Link to="/" className="flex items-center gap-3">
          <img src="/acm-logo.webp" alt="ACM Logo" className="w-8 h-8" style={{ imageRendering: 'auto' }} />
          <img src="/logoacnsnioe.webp" alt="ACM SNIOE Logo" className="h-6 w-auto pointer-events-none" style={{ imageRendering: 'pixelated' }} />
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white p-2"
        >
          {sidebarOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-full md:h-screen z-40
        w-64 bg-[#1a0f30] border-r-2 border-[#ff8cbe] p-6 flex flex-col shrink-0
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <Link to="/" className="mb-10 hidden md:flex items-center gap-3">
          <img src="/acm-logo.webp" alt="ACM Logo" className="w-10 h-10" style={{ imageRendering: 'auto' }} />
          <img src="/logoacnsnioe.webp" alt="ACM SNIOE Logo" className="h-8 w-auto pointer-events-none" style={{ imageRendering: 'pixelated' }} />
        </Link>

        {/* Close button for mobile sidebar */}
        <div className="md:hidden flex justify-end mb-6">
          <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 flex flex-col gap-4 font-vt323 text-2xl">
          <Link 
            to="/admin/team" 
            className={`flex items-center gap-3 p-3 rounded transition-colors border-2 ${location.pathname === '/admin/team' || location.pathname === '/admin' ? 'bg-[#ff5ea6]/20 border-[#ff5ea6] text-[#ff8cbe]' : 'border-transparent hover:bg-white/5 hover:border-white/20'}`}
          >
            <Users size={24} />
            Guild Members
          </Link>
          <Link 
            to="/admin/events" 
            className={`flex items-center gap-3 p-3 rounded transition-colors border-2 ${location.pathname.startsWith('/admin/events') ? 'bg-[#ff5ea6]/20 border-[#ff5ea6] text-[#ff8cbe]' : 'border-transparent hover:bg-white/5 hover:border-white/20'}`}
          >
            <Calendar size={24} />
            Quests / Events
          </Link>
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <Link 
            to="/"
            className="flex items-center gap-3 p-3 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-colors font-vt323 text-2xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Back to Homepage
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors font-vt323 text-2xl"
          >
            <LogOut size={24} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative min-h-screen">
        {/* Background Decor */}
        <StarrySky count={100} />
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <img src="/bgclouds2.webp" alt="Clouds" className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
        </div>
        
        <div className="relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
