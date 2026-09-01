import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const reviewerApi = {
  validateInvitation: async (token: string) => {
    const response = await axios.get(`${API_URL}/reviewer/validate-invitation?token=${token}`);
    return response.data;
  },
  acceptInvitation: async (data: { token: string; password: string }) => {
    const response = await axios.post(`${API_URL}/reviewer/accept-invitation`, data);
    return response.data;
  }
};
