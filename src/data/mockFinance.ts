export interface MockFinanceTransaction {
  id: string;
  request_id?: string | null;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
}

export interface FinanceStatsSnapshot {
  totalIncome: number;
  totalExpenses: number;
  profit: number;
  margin: number;
  avgCheck: number;
  incomeCount: number;
  expenseCount: number;
}

const mockFinanceTransactions: MockFinanceTransaction[] = [
  {
    id: 'fin-2026-02-01',
    type: 'income',
    description: 'Корпоративный ремонт ноутбуков для офиса',
    amount: 68500,
    date: '2026-02-06T11:30:00.000Z',
  },
  {
    id: 'fin-2026-02-02',
    type: 'expense',
    description: 'Закупка дисплеев и аккумуляторов',
    amount: 26300,
    date: '2026-02-09T10:15:00.000Z',
  },
  {
    id: 'fin-2026-02-03',
    type: 'income',
    description: 'Восстановление техники после залития',
    amount: 47200,
    date: '2026-02-18T15:20:00.000Z',
  },
  {
    id: 'fin-2026-02-04',
    type: 'expense',
    description: 'Аренда, логистика и расходники',
    amount: 18900,
    date: '2026-02-27T09:00:00.000Z',
  },
  {
    id: 'fin-2026-03-01',
    type: 'income',
    description: 'Сервисный контракт на обслуживание оргтехники',
    amount: 81200,
    date: '2026-03-04T14:10:00.000Z',
  },
  {
    id: 'fin-2026-03-02',
    type: 'expense',
    description: 'Поставка печатающих головок и роликов',
    amount: 31400,
    date: '2026-03-08T12:40:00.000Z',
  },
  {
    id: 'fin-2026-03-03',
    type: 'income',
    description: 'Ремонт игровых ПК и рабочих станций',
    amount: 59300,
    date: '2026-03-19T16:05:00.000Z',
  },
  {
    id: 'fin-2026-03-04',
    type: 'expense',
    description: 'Фонд оплаты труда мастерской',
    amount: 27600,
    date: '2026-03-26T18:15:00.000Z',
  },
  {
    id: 'fin-2026-04-01',
    type: 'income',
    description: 'Комплексный ремонт смартфонов и планшетов',
    amount: 73400,
    date: '2026-04-05T13:25:00.000Z',
  },
  {
    id: 'fin-2026-04-02',
    type: 'expense',
    description: 'Закупка модулей Face ID и стекол',
    amount: 22800,
    date: '2026-04-11T09:50:00.000Z',
  },
  {
    id: 'fin-2026-04-03',
    type: 'income',
    description: 'Сложный ремонт материнских плат',
    amount: 64800,
    date: '2026-04-17T17:10:00.000Z',
  },
  {
    id: 'fin-2026-04-04',
    type: 'expense',
    description: 'Обновление инструмента и расходных материалов',
    amount: 24100,
    date: '2026-04-29T11:00:00.000Z',
  },
  {
    id: 'fin-2026-05-01',
    request_id: '2026-003',
    type: 'income',
    description: 'Ремонт iPhone 13 Pro',
    amount: 6500,
    date: '2026-05-03T12:20:00.000Z',
  },
  {
    id: 'fin-2026-05-02',
    request_id: '2026-004',
    type: 'income',
    description: 'Ремонт HP LaserJet Pro M404dn',
    amount: 3500,
    date: '2026-05-03T14:10:00.000Z',
  },
  {
    id: 'fin-2026-05-03',
    request_id: '2026-002',
    type: 'expense',
    description: 'Закупка дисплея для Samsung Galaxy S23 Ultra',
    amount: 9200,
    date: '2026-05-05T10:40:00.000Z',
  },
  {
    id: 'fin-2026-05-04',
    request_id: '2026-006',
    type: 'income',
    description: 'Восстановление HP EliteDesk 800 G6',
    amount: 2500,
    date: '2026-05-05T16:30:00.000Z',
  },
  {
    id: 'fin-2026-05-05',
    request_id: '2026-008',
    type: 'expense',
    description: 'Замена USB-порта и чистка после влаги',
    amount: 2800,
    date: '2026-05-06T13:15:00.000Z',
  },
  {
    id: 'fin-2026-05-06',
    request_id: '2026-010',
    type: 'income',
    description: 'Замена батареи MacBook Air M2',
    amount: 18000,
    date: '2026-05-06T11:50:00.000Z',
  },
  {
    id: 'fin-2026-05-07',
    request_id: '2026-015',
    type: 'income',
    description: 'Профилактика Canon PIXMA G6040',
    amount: 2000,
    date: '2026-05-07T15:35:00.000Z',
  },
  {
    id: 'fin-2026-05-08',
    type: 'expense',
    description: 'Налоги, аренда и коммунальные расходы',
    amount: 21400,
    date: '2026-05-07T09:20:00.000Z',
  },
];

export function getMockFinanceSnapshot(startDate?: string, endDate?: string) {
  const transactions = filterTransactionsByDate(mockFinanceTransactions, startDate, endDate);
  const stats = buildFinanceStats(transactions);

  return {
    transactions,
    stats,
  };
}

function filterTransactionsByDate(
  transactions: MockFinanceTransaction[],
  startDate?: string,
  endDate?: string,
) {
  return transactions.filter((transaction) => {
    if (startDate && transaction.date < startDate) {
      return false;
    }

    if (endDate && transaction.date > endDate) {
      return false;
    }

    return true;
  });
}

function buildFinanceStats(transactions: MockFinanceTransaction[]): FinanceStatsSnapshot {
  const incomeTransactions = transactions.filter((transaction) => transaction.type === 'income');
  const expenseTransactions = transactions.filter((transaction) => transaction.type === 'expense');

  const totalIncome = incomeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalExpenses = expenseTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  const profit = totalIncome - totalExpenses;
  const margin = totalIncome > 0 ? Number(((profit / totalIncome) * 100).toFixed(1)) : 0;
  const avgCheck = incomeTransactions.length > 0 ? Math.round(totalIncome / incomeTransactions.length) : 0;

  return {
    totalIncome,
    totalExpenses,
    profit,
    margin,
    avgCheck,
    incomeCount: incomeTransactions.length,
    expenseCount: expenseTransactions.length,
  };
}
