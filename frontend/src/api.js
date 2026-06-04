// src/api.js
// Single source of truth for the backend URL.
// In dev  → http://localhost:8080  (from .env)
// In prod  → https://your-backend.onrender.com  (from Render env vars)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default BASE_URL;
