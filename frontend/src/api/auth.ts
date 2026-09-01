import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authApi = {
  signup: async (data: any) => {
    const response = await axios.post(`${API_URL}/auth/signup`, data);
    return response.data;
  },
  verifyOtp: async (data: any) => {
    const response = await axios.post(`${API_URL}/auth/verify-otp`, data);
    return response.data;
  },
  resendOtp: async (data: any) => {
    const response = await axios.post(`${API_URL}/auth/resend-otp`, data);
    return response.data;
  }
};
