import { useMemo } from 'react';
import { getMonthDates } from '../lib/finance';
import { Priority, RepairRequest, RequestStatus } from '../types';
import { useFinanceData } from './useFinanceData';
import { useRequests } from './useRequests';

const STATUS_META: Array<{
  status: RequestStatus;
  label: string;
  barClassName: string;
}> = [
  { status: 'new', label: 'Новые', barClassName: 'from-blue-500 to-indigo-500' },
  { status: 'in_progress', label: 'В работе', barClassName: 'from-amber-500 to-orange-500' },
  { status: 'waiting_parts', label: 'Ожидание запчастей', barClassName: 'from-violet-500 to-purple-500' },
  { status: 'completed', label: 'Выполнено', barClassName: 'from-emerald-500 to-green-500' },
  { status: 'cancelled', label: 'Отменено', barClassName: 'from-rose-500 to-red-500' },
];

const PRIORITY_META: Array<{
  priority: Priority;
  label: string;
  textClassName: string;
}> = [
  { priority: 'high', label: 'Высокий', textClassName: 'text-rose-700' },
  { priority: 'medium', label: 'Средний', textClassName: 'text-amber-700' },
  { priority: 'low', label: 'Низкий', textClassName: 'text-slate-700' },
];

export function useReportsData(selectedMonth: string) {
  const finance = useFinanceData(selectedMonth);
  const requestsState = useRequests();

  const analytics = useMemo(() => {
    const [startDate, endDate] = getMonthDates(selectedMonth);
    const filteredRequests = filterRequestsByMonth(requestsState.requests, startDate, endDate);

    const totalRequests = filteredRequests.length;
    const completedRequests = filteredRequests.filter((request) => request.status === 'completed').length;
    const completionRate = totalRequests > 0 ? Number(((completedRequests / totalRequests) * 100).toFixed(1)) : 0;

    const statusBreakdown = STATUS_META.map((item) => {
      const count = filteredRequests.filter((request) => request.status === item.status).length;
      const share = totalRequests > 0 ? Number(((count / totalRequests) * 100).toFixed(1)) : 0;

      return {
        ...item,
        count,
        share,
      };
    });

    const deviceBreakdown = buildDeviceBreakdown(filteredRequests, totalRequests);
    const priorityBreakdown = PRIORITY_META.map((item) => {
      const count = filteredRequests.filter((request) => request.priority === item.priority).length;
      const share = totalRequests > 0 ? Number(((count / totalRequests) * 100).toFixed(1)) : 0;

      return {
        ...item,
        count,
        share,
      };
    });

    const incomeTransactions = finance.transactions
      .filter((transaction) => transaction.type === 'income')
      .sort((left, right) => right.amount - left.amount)
      .slice(0, 5);

    return {
      filteredRequests,
      totalRequests,
      completedRequests,
      completionRate,
      statusBreakdown,
      deviceBreakdown,
      priorityBreakdown,
      incomeTransactions,
    };
  }, [finance.transactions, requestsState.requests, selectedMonth]);

  return {
    ...analytics,
    finance,
    loading: finance.loading || requestsState.loading,
    requestsError: requestsState.error,
    requestsUsingFallbackData: requestsState.usingFallbackData,
    requestsDataSource: requestsState.dataSource,
  };
}

function filterRequestsByMonth(requests: RepairRequest[], startDate: string, endDate: string) {
  const startTimestamp = new Date(startDate).getTime();
  const endTimestamp = new Date(endDate).getTime();

  return requests.filter((request) => {
    const createdTimestamp = request.createdAt.getTime();

    return (
      !Number.isNaN(createdTimestamp) &&
      createdTimestamp >= startTimestamp &&
      createdTimestamp <= endTimestamp
    );
  });
}

function buildDeviceBreakdown(requests: RepairRequest[], totalRequests: number) {
  const deviceCounts = new Map<string, number>();

  requests.forEach((request) => {
    const deviceLabel = request.deviceType?.trim() || 'Не указано';
    deviceCounts.set(deviceLabel, (deviceCounts.get(deviceLabel) ?? 0) + 1);
  });

  const maxCount = Math.max(...deviceCounts.values(), 1);

  return Array.from(deviceCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([label, count]) => ({
      label,
      count,
      share: totalRequests > 0 ? Number(((count / totalRequests) * 100).toFixed(1)) : 0,
      width: `${(count / maxCount) * 100}%`,
    }));
}
