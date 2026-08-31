import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const usersApi = {
  searchReviewers: async (search: string) => {
    const { data } = await axios.get(`${API_URL}/users/reviewers`, {
      params: { search },
      withCredentials: true
    });
    return data;
  }
};
