// API Configuration for Mobile and Web App
// Update this file based on your deployment

// =============================================================================
// CONFIGURATION OPTIONS
// =============================================================================

// Option 1: For LOCAL TESTING with mobile device on SAME WiFi network
// - Find your computer's IP: ifconfig | grep "inet " (look for 192.168.x.x)
// - Keep your server running: npm run dev
// - Update LOCAL_IP below with your computer's IP address
const LOCAL_IP = '192.168.1.XXX'; // CHANGE THIS to your computer's IP!

// Option 2: For PRODUCTION (deployed backend server)
// - Replace with your actual deployed backend URL
// - Examples: 'https://your-app.onrender.com', 'https://api.yourapp.com'
const PRODUCTION_URL = 'https://your-backend.com';

// =============================================================================
// DO NOT EDIT BELOW (unless you know what you're doing)
// =============================================================================

export const API_CONFIG = {
  // Development: Running on local computer or same network
  development: {
    baseURL: import.meta.env.VITE_API_URL || `http://${LOCAL_IP}:5000`,
    timeout: 10000,
  },

  // Production: Deployed to cloud service
  production: {
    baseURL: import.meta.env.VITE_API_URL || PRODUCTION_URL,
    timeout: 10000,
  },
};

// Automatically detect environment
const isDevelopment = import.meta.env.DEV;
const config = isDevelopment ? API_CONFIG.development : API_CONFIG.production;

export const API_BASE_URL = config.baseURL;
export const API_TIMEOUT = config.timeout;

// Helper to get full API URL
export function getApiUrl(endpoint: string): string {
  // If endpoint already has a full URL, return as-is
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  
  // If endpoint starts with /, remove it to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  return `${API_BASE_URL}/${cleanEndpoint}`;
}

// Log configuration in development
if (isDevelopment) {
  console.log('🔧 API Configuration:', {
    mode: 'development',
    baseURL: API_BASE_URL,
    note: LOCAL_IP === '192.168.1.XXX' 
      ? '⚠️ WARNING: Update LOCAL_IP in api.config.ts with your computer\'s IP address!'
      : '✅ Using custom IP configuration'
  });
} else {
  console.log('🚀 API Configuration:', {
    mode: 'production',
    baseURL: API_BASE_URL,
  });
}

