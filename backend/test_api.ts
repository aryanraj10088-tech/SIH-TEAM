import dotenv from 'dotenv';
dotenv.config();
import http from 'http';

const API_URL = 'http://localhost:5000/api';

async function run() {
  const creds = { email: 'operator@srijansetu.com', password: 'password123' };
  
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(creds)
  });
  
  const loginData = await loginRes.json();
  const cookies = loginRes.headers.get('set-cookie');
  // Handle multiple cookies or just take the raw string if fetch returns it comma separated
  // Node 18 fetch merges set-cookie with commas, which is annoying.
  // Let's use standard node http module to avoid fetch set-cookie issues.
}

run().catch(console.error);
