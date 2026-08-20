export const API_BASE_URL = import.meta.env.VITE_API_URL || '/backend/api';

export const getAuthToken = () => localStorage.getItem('adminToken');

export const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    // Optional: handle unauthorized globally (e.g., redirect to login)
    localStorage.removeItem('adminToken');
    if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
      window.location.href = '/admin/login';
    }
  }

  return response;
};

// --- Team API ---
export const fetchTeam = async () => {
  const res = await fetch(`${API_BASE_URL}/team`);
  if (!res.ok) throw new Error('Failed to fetch team');
  return res.json(); // returns { core: [...], subcore: [...] }
};

// --- Events API ---
export const fetchFeaturedEvents = async () => {
  const res = await fetch(`${API_BASE_URL}/events/featured`);
  if (!res.ok) throw new Error('Failed to fetch featured events');
  return res.json();
};

export const fetchAllEvents = async () => {
  const res = await fetch(`${API_BASE_URL}/events`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
};
