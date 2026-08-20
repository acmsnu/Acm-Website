import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import AdminLayout from './pages/AdminLayout';
import AdminLogin from './pages/AdminLogin';
import AdminTeam from './pages/AdminTeam';
import AdminEvents from './pages/AdminEvents';

export default function App() {
  return (
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
  );
}
