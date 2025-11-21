import axiosInstance from './axiosConfig';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<string> => {
    const response = await axiosInstance.get<string>('/auth/me');
    return response.data;
  },
};
