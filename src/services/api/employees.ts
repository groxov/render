import { ApiEmployeeItem, ApiResponse } from '../../types';
import { apiRequest } from './client';

export const employeesApi = {
  getAll: async (): Promise<ApiResponse<ApiEmployeeItem[]>> => apiRequest<ApiEmployeeItem[]>('/employees'),
};
