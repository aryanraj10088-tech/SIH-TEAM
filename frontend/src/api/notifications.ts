import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Notification {
  _id: string;
  type: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getNotifications: async () => {
    const { data } = await axios.get<Notification[]>(`${API_URL}/notifications`, {
      withCredentials: true
    });
    return data;
  },

  markAsRead: async (id: string) => {
    const { data } = await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
      withCredentials: true
    });
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await axios.patch(`${API_URL}/notifications/read-all`, {}, {
      withCredentials: true
    });
    return data;
  }
};
