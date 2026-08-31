import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface SystemStats {
  totalUsers: number;
  totalProjects: number;
  totalOutputs: number;
  pendingReviews: number;
  approvedOutputs: number;
  rejectedOutputs: number;
}

export const adminApi = {
  getSystemStats: async () => {
    const { data } = await axios.get<SystemStats>(`${API_URL}/admin/stats`, {
      withCredentials: true
    });
    return data;
  }
};
