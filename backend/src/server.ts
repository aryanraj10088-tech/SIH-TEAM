import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectDB from './config/db';

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    
    // Start polling keep-alive if enabled
    startKeepAlive();
  });
});

// --- Keep-Alive Polling for Render Free Tier ---
// Pings the backend and AI service every 10 minutes to prevent them from sleeping.
function startKeepAlive() {
  const POLLING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
  
  // Try to use Render's external URL, fallback to localhost for development
  const backendUrl = process.env.RENDER_EXTERNAL_URL 
    ? `${process.env.RENDER_EXTERNAL_URL}/api/health` 
    : `http://localhost:${PORT}/api/health`;
    
  const aiServiceUrl = process.env.AI_SERVICE_URL 
    ? `${process.env.AI_SERVICE_URL.replace(/\/$/, '')}/health`
    : null;

  console.log(`Starting Keep-Alive Poller: Pinging every 10 minutes.`);
  
  setInterval(async () => {
    try {
      console.log(`[Keep-Alive] Pinging Backend: ${backendUrl}`);
      await fetch(backendUrl);
      
      if (aiServiceUrl) {
        console.log(`[Keep-Alive] Pinging AI Service: ${aiServiceUrl}`);
        await fetch(aiServiceUrl);
      }
    } catch (err: any) {
      console.error(`[Keep-Alive] Error during ping: ${err.message}`);
    }
  }, POLLING_INTERVAL_MS);
}
