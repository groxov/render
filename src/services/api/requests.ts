import { ApiRequestItem, ApiResponse } from '../../types';
import { apiRequest } from './client';

export const requestsApi = {
  getAll: async (): Promise<ApiResponse<ApiRequestItem[]>> => apiRequest<ApiRequestItem[]>('/requests'),

  create: async (data: Partial<ApiRequestItem>): Promise<ApiResponse<ApiRequestItem>> =>
    apiRequest<ApiRequestItem>('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getById: async (id: string): Promise<ApiResponse<ApiRequestItem>> =>
    apiRequest<ApiRequestItem>(`/requests/${id}`),

  update: async (id: string, data: Partial<ApiRequestItem>): Promise<ApiResponse<ApiRequestItem>> =>
    apiRequest<ApiRequestItem>(`/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: async (id: string): Promise<ApiResponse<void>> =>
    apiRequest<void>(`/requests/${id}`, {
      method: 'DELETE',
    }),
};
