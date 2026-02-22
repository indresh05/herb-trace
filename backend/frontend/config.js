// Global configuration for the frontend
const CONFIG = {
    // When running locally, use localhost:3000. 
    // When deployed on Vercel, point to the GCP VM's IP or Domain.
    // Replace 'https://your-gcp-backend-domain.com' with your actual GCP domain or IP later!
    API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'https://your-gcp-backend-domain.com'
};
