const isLocal = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.');

export const API_URL = isLocal
    ? 'http://localhost:3000'
    : 'https://hallway-app.onrender.com';
