import { ApiResponse, FinanceFilters, FinanceStats, FinanceTransaction } from '../../types';
import { apiRequest, createQueryString } from './client';

export const financeApi = {
  getTransactions: async (filters?: FinanceFilters): Promise<ApiResponse<FinanceTransaction[]>> => {
    const query = createQueryString(filters ?? {});
    return apiRequest<FinanceTransaction[]>(`/finance/transactions${query ? `?${query}` : ''}`);
  },

  getStats: async (
    filters?: Pick<FinanceFilters, 'startDate' | 'endDate'>,
  ): Promise<ApiResponse<FinanceStats>> => {
    const query = createQueryString(filters ?? {});
    return apiRequest<FinanceStats>(`/finance/stats${query ? `?${query}` : ''}`);
  },

  createTransaction: async (
    data: Omit<FinanceTransaction, 'id'>,
  ): Promise<ApiResponse<FinanceTransaction>> =>
    apiRequest<FinanceTransaction>('/finance/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteTransaction: async (id: string): Promise<ApiResponse<void>> =>
    apiRequest<void>(`/finance/transactions/${id}`, {
      method: 'DELETE',
    }),
};
