import { useEffect, useState } from 'react';
import { getMockFinanceSnapshot } from '../data/mockFinance';
import { getMonthDates } from '../lib/finance';
import { financeApi } from '../services/api';
import { FinanceStats, FinanceTransaction } from '../types';

export interface FinanceListItem {
  id: string;
  date: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  request_id?: string | null;
}

export type FinanceDataSource = 'api' | 'fallback_empty' | 'fallback_error';

export function useFinanceData(selectedMonth: string) {
  const [transactions, setTransactions] = useState<FinanceListItem[]>([]);
  const [stats, setStats] = useState<FinanceStats>(getEmptyFinanceStats());
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<FinanceDataSource>('api');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [startDate, endDate] = getMonthDates(selectedMonth);

      try {
        setLoading(true);
        setError(null);

        const [transactionsResponse, statsResponse] = await Promise.all([
          financeApi.getTransactions({ startDate, endDate }),
          financeApi.getStats({ startDate, endDate }),
        ]);

        const apiTransactions = transactionsResponse.success
          ? transactionsResponse.data.map(mapTransactionToListItem)
          : [];

        const apiStats = statsResponse.success
          ? normalizeFinanceStats(statsResponse.data)
          : getEmptyFinanceStats();

        if (hasMeaningfulFinanceData(apiTransactions, apiStats)) {
          setTransactions(apiTransactions);
          setStats(apiStats);
          setDataSource('api');
          return;
        }

        hydrateFallbackState(startDate, endDate, 'fallback_empty', setTransactions, setStats, setDataSource);
      } catch (requestError) {
        console.error('Error loading finance data:', requestError);
        setError(
          requestError instanceof Error ? requestError.message : 'Не удалось обновить финансовые данные.',
        );
        hydrateFallbackState(startDate, endDate, 'fallback_error', setTransactions, setStats, setDataSource);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [selectedMonth]);

  return {
    transactions,
    stats,
    loading,
    error,
    dataSource,
    usingFallbackData: dataSource !== 'api',
    fallbackReason: dataSource === 'api' ? null : dataSource,
  };
}

function hydrateFallbackState(
  startDate: string,
  endDate: string,
  dataSource: Exclude<FinanceDataSource, 'api'>,
  setTransactions: (value: FinanceListItem[]) => void,
  setStats: (value: FinanceStats) => void,
  setDataSource: (value: FinanceDataSource) => void,
) {
  const fallbackSnapshot = getMockFinanceSnapshot(startDate, endDate);
  setTransactions(fallbackSnapshot.transactions.map(mapTransactionToListItem));
  setStats(fallbackSnapshot.stats);
  setDataSource(dataSource);
}

function mapTransactionToListItem(transaction: FinanceTransaction): FinanceListItem {
  return {
    id: transaction.id,
    date: new Date(transaction.date).toLocaleDateString('ru-RU'),
    type: transaction.type,
    description: transaction.description,
    amount: Number(transaction.amount),
    request_id: transaction.request_id,
  };
}

function hasMeaningfulFinanceData(transactions: FinanceListItem[], stats: FinanceStats) {
  return (
    transactions.length > 0 ||
    stats.totalIncome > 0 ||
    stats.totalExpenses > 0 ||
    stats.profit !== 0 ||
    stats.avgCheck > 0 ||
    stats.incomeCount > 0 ||
    stats.expenseCount > 0
  );
}

function normalizeFinanceStats(data: Partial<FinanceStats>): FinanceStats {
  return {
    totalIncome: Number(data.totalIncome ?? 0),
    totalExpenses: Number(data.totalExpenses ?? 0),
    profit: Number(data.profit ?? 0),
    margin: Number(data.margin ?? 0),
    avgCheck: Number(data.avgCheck ?? 0),
    incomeCount: Number(data.incomeCount ?? 0),
    expenseCount: Number(data.expenseCount ?? 0),
  };
}

function getEmptyFinanceStats(): FinanceStats {
  return {
    totalIncome: 0,
    totalExpenses: 0,
    profit: 0,
    margin: 0,
    avgCheck: 0,
    incomeCount: 0,
    expenseCount: 0,
  };
}
