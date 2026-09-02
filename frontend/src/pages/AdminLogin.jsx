import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';
import StarrySky from '../components/StarrySky';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If they already have a token, check if it's valid, and if so, redirect them straight in
    const checkExistingLogin = async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          const res = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            navigate('/admin/team');
          }
        } catch (err) {
          console.error("Token verification failed on login screen", err);
        }
      }
    };
    checkExistingLogin();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('adminToken', data.token);
        navigate('/admin/team');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d071d] flex flex-col items-center justify-center p-4 relative overflow-hidden text-white selection:bg-pink-500">
      
      {/* Background Decor */}
      <StarrySky count={100} />
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <img src="/bgclouds2.webp" alt="Clouds" className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
      </div>

      {/* Fake Star Easter Egg */}
      <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer" className="absolute top-[15%] right-[15%] md:top-[20%] md:right-[20%] w-3 h-3 bg-[#ff5ea6] shadow-[0_0_15px_#ff5ea6] rotate-45 cursor-pointer z-50 animate-[pulse_2s_ease-in-out_infinite] hover:scale-150 transition-transform" title="A weird star..."></a>

      <div className="z-10 bg-[#1a0f30]/80 p-8 md:p-12 rounded-xl border-[4px] border-[#ff5ea6] shadow-[8px_8px_0_rgba(255,94,166,0.3)] w-full max-w-md relative">
        <h2 className="font-pixelify text-4xl md:text-5xl text-center mb-2 drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
          Admin <span className="text-[#ff5ea6]">Access</span>
        </h2>
        <p className="font-vt323 text-gray-400 text-center mb-8 text-xl">Enter credentials to enter the guild.</p>

        {error && (
          <div className="bg-red-500/20 border-2 border-red-500 text-red-200 font-vt323 text-lg p-3 rounded mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-6 font-vt323 text-2xl">
          <div className="flex flex-col gap-2">
            <label className="text-[#ff8cbe]">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-black/50 border-2 border-[#ff8cbe]/50 rounded p-3 text-white focus:outline-none focus:border-[#ff5ea6] focus:bg-black/70 transition-colors"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[#ff8cbe]">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-black/50 border-2 border-[#ff8cbe]/50 rounded p-3 text-white focus:outline-none focus:border-[#ff5ea6] focus:bg-black/70 transition-colors"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="mt-4 bg-[#ff5ea6] hover:bg-[#ff8cbe] text-black font-bold py-3 rounded border-b-4 border-[#3b2d1d] active:border-b-0 active:translate-y-[4px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'LOGIN'}
          </button>
        </form>
      </div>

      <a href="/" className="mt-8 z-10 font-vt323 text-xl text-gray-400 hover:text-white underline">
        Return to Homepage
      </a>
    </div>
  );
}
