import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getAuthToken, API_BASE_URL, fetchWithAuth } from '../utils/api';
import { Users, Calendar, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);

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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  if (isVerifying) {
    return <div className="min-h-screen bg-[#0d071d] text-white flex items-center justify-center font-vt323 text-3xl">Verifying Access...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0d071d] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a0f30] border-r-2 border-[#ff8cbe] p-6 flex flex-col z-10 shrink-0">
        <Link to="/" className="mb-10 flex items-center gap-3">
          <img src="/acm-logo.webp" alt="ACM Logo" className="w-10 h-10" style={{ imageRendering: 'auto' }} />
          <img src="/logoacnsnioe.webp" alt="ACM SNIOE Logo" className="h-8 w-auto pointer-events-none" style={{ imageRendering: 'pixelated' }} />
        </Link>
        
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

        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors font-vt323 text-2xl"
        >
          <LogOut size={24} />
          Log Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {/* Background Decor */}
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
