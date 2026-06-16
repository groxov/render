import { ApiResponse, AuthResponse } from '../../types';
import { apiRequest } from './client';

export const authApi = {
  login: async (username: string, password: string): Promise<ApiResponse<AuthResponse>> =>
    apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: async (
    username: string,
    email: string,
    password: string,
    name?: string,
  ): Promise<ApiResponse<AuthResponse>> =>
    apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, name }),
    }),
};
