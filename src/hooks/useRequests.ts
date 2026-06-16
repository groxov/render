import { useCallback, useEffect, useState } from 'react';
import { mockRequests } from '../data/mockData';
import { requestsApi } from '../services/api';
import { RepairRequest } from '../types';
import { transformApiRequestsToRepairRequests } from '../utils/transformers';

export type RequestsDataSource = 'loading' | 'api' | 'empty' | 'fallback_mock';

interface RequestsState {
  requests: RepairRequest[];
  dataSource: RequestsDataSource;
}

const INITIAL_STATE: RequestsState = {
  requests: [],
  dataSource: 'loading',
};

export function useRequests() {
  const [state, setState] = useState<RequestsState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await requestsApi.getAll();
      const nextRequests = response.success ? transformApiRequestsToRepairRequests(response.data ?? []) : [];

      setState({
        requests: nextRequests,
        dataSource: nextRequests.length > 0 ? 'api' : 'empty',
      });
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : 'Не удалось загрузить журнал заявок.';

      console.error('Error loading requests:', requestError);
      setError(message);
      setState((current) =>
        current.dataSource === 'api' || current.dataSource === 'empty'
          ? current
          : {
              requests: mockRequests,
              dataSource: 'fallback_mock',
            },
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  return {
    requests: state.requests,
    loading,
    error,
    refreshRequests: loadRequests,
    usingFallbackData: state.dataSource === 'fallback_mock',
    isApiEmpty: state.dataSource === 'empty',
    dataSource: state.dataSource,
  };
}
