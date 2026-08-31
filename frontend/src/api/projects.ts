import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const projectsApi = {
  getAssignableProjects: async () => {
    const { data } = await axios.get(`${API_URL}/projects/admin/assignable`, {
      withCredentials: true
    });
    return data;
  },

  addReviewer: async (projectId: string, reviewerId: string) => {
    const { data } = await axios.post(`${API_URL}/projects/${projectId}/assign-reviewer`, 
      { reviewerId }, 
      { withCredentials: true }
    );
    return data;
  },

  removeReviewer: async (projectId: string, reviewerId: string) => {
    const { data } = await axios.delete(`${API_URL}/projects/${projectId}/assign-reviewer/${reviewerId}`, {
      withCredentials: true
    });
    return data;
  }
};
