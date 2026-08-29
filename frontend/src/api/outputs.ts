import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const outputsApi = {
  getOutputs: async (projectId: string) => {
    const { data } = await axios.get(`${API_URL}/outputs`, {
      params: { projectId },
      withCredentials: true
    });
    return data;
  },

  getOutputById: async (outputId: string) => {
    const { data } = await axios.get(`${API_URL}/outputs/${outputId}`, {
      withCredentials: true
    });
    return data;
  },

  editContent: async (outputId: string, content: any, note?: string) => {
    const { data } = await axios.patch(`${API_URL}/outputs/${outputId}/content`, 
      { content, note }, 
      { withCredentials: true }
    );
    return data;
  },

  submitForReview: async (outputId: string) => {
    const { data } = await axios.post(`${API_URL}/outputs/${outputId}/submit`, 
      {}, 
      { withCredentials: true }
    );
    return data;
  },

  addComment: async (outputId: string, text: string) => {
    const { data } = await axios.post(`${API_URL}/outputs/${outputId}/comment`, 
      { text }, 
      { withCredentials: true }
    );
    return data;
  },

  reviewOutput: async (outputId: string, action: 'approve' | 'reject', note?: string) => {
    const { data } = await axios.post(`${API_URL}/outputs/${outputId}/review`, 
      { action, note }, 
      { withCredentials: true }
    );
    return data;
  }
};

