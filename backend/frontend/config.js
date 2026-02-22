// Global configuration for the frontend
const CONFIG = {
    // When running locally, use localhost:3000. 
    // When deployed on Vercel, point to the ngrok URL!
    // IMPORTANT: Do NOT put a trailing slash '/' at the end of the ngrok URL
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'https://752e-2401-4900-1c64-f739-7dcf-c114-f61a-e4f8.ngrok-free.app' // <-- REPLACE THIS WITH YOUR NGROK URL
};
