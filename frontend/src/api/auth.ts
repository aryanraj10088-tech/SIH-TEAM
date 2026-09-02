import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authApi = {
  /**
   * Create a new account. The backend now issues a JWT cookie and returns the
   * user object immediately — no OTP step required.
   * Response: { _id, name, email, role }
   */
  signup: async (data: { name: string; email: string; password: string; accountType: string }) => {
    const response = await axios.post(`${API_URL}/auth/signup`, data, { withCredentials: true });
    return response.data;
  },

  // ── OTP methods — commented out, preserved for easy restoration ────────────
  // verifyOtp: async (data: any) => {
  //   const response = await axios.post(`${API_URL}/auth/verify-otp`, data);
  //   return response.data;
  // },
  // resendOtp: async (data: any) => {
  //   const response = await axios.post(`${API_URL}/auth/resend-otp`, data);
  //   return response.data;
  // },
};
