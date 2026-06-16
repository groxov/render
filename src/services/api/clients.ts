import { ApiClientItem, ApiResponse } from '../../types';
import { apiRequest } from './client';

export const clientsApi = {
  getAll: async (): Promise<ApiResponse<ApiClientItem[]>> => apiRequest<ApiClientItem[]>('/clients'),
};
