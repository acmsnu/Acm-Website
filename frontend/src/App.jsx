import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import AdminLayout from './pages/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import AdminTeam from './pages/AdminTeam';
import AdminEvents from './pages/AdminEvents';
import LoadingScreen from './components/LoadingScreen';

export default function App() {
  const [appLoaded, setAppLoaded] = useState(false);

  return (
    <>
      {/* The LoadingScreen handles its own unmount animation and will disappear when done */}
      {!appLoaded && <LoadingScreen onLoadingComplete={() => setAppLoaded(true)} />}
      
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminTeam />} />
            <Route path="team" element={<AdminTeam />} />
            <Route path="events" element={<AdminEvents />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
