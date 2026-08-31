import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function run() {
  try {
    const creds = { email: 'operator@srijansetu.com', password: 'password123' };
    const loginRes = await axios.post(`${API_URL}/auth/login`, creds);
    console.log('Logged in:', loginRes.data.email);
    
    const cookie = loginRes.headers['set-cookie']?.[0];

    const createRes = await axios.post(`${API_URL}/projects`, {
      title: 'New Test Project',
      description: 'Testing creation'
    }, {
      headers: { Cookie: cookie }
    });
    console.log('Create project status:', createRes.status);
    console.log('Create project data:', createRes.data);
  } catch (error: any) {
    console.error('Error:', error.response?.status, error.response?.data || error.message);
  }
}

run();
