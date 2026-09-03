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
  },
  getReviewers: async () => {
    const { data } = await axios.get(`${API_URL}/admin/reviewers`, {
      withCredentials: true
    });
    return data;
  },
  inviteReviewer: async (payload: { name: string, email: string }) => {
    const { data } = await axios.post(`${API_URL}/admin/reviewers/invite`, payload, {
      withCredentials: true
    });
    return data;
  },
  resendInvitation: async (id: string) => {
    const { data } = await axios.post(`${API_URL}/admin/reviewers/${id}/resend-invitation`, {}, {
      withCredentials: true
    });
    return data;
  },
  getPendingUsers: async () => {
    const { data } = await axios.get(`${API_URL}/admin/pending-users`, {
      withCredentials: true
    });
    return data;
  },
  approveUser: async (id: string, role: string) => {
    const { data } = await axios.post(`${API_URL}/admin/pending-users/${id}/approve`, { role }, {
      withCredentials: true
    });
    return data;
  },
  rejectUser: async (id: string) => {
    const { data } = await axios.post(`${API_URL}/admin/pending-users/${id}/reject`, {}, {
      withCredentials: true
    });
    return data;
  }
};
