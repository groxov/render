import { dbAll, dbGet } from '../database/db';
import { asyncHandler, sendSuccess } from '../utils/http';

interface StatsQuery {
  startDate?: string;
  endDate?: string;
}

interface DashboardRequestsStats {
  total: number;
  new_count: number;
  in_progress_count: number;
  completed_count: number;
  waiting_count: number;
  cancelled_count: number;
}

interface DeviceStatsRow {
  device_type: string;
  count: number;
}

interface EmployeeStatsRow {
  id: string;
  name: string;
  assigned_count: number;
  completed_repairs: number;
}

interface InventoryStatsRow {
  total_positions: number;
  total_units: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

interface FinanceStatsRow {
  total_income: number;
  total_expenses: number;
}

interface RequestTimelineRow {
  date: string;
  count: number;
  status: string;
}

export const getDashboardStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query as StatsQuery;
  const requestFilters: string[] = [];
  const requestParams: unknown[] = [];
  const transactionFilters: string[] = [];
  const transactionParams: unknown[] = [];

  if (startDate) {
    requestFilters.push('created_at >= ?');
    requestParams.push(startDate);
    transactionFilters.push('date >= ?');
    transactionParams.push(startDate);
  }

  if (endDate) {
    requestFilters.push('created_at <= ?');
    requestParams.push(endDate);
    transactionFilters.push('date <= ?');
    transactionParams.push(endDate);
  }

  const requestsWhereClause = requestFilters.length > 0 ? `WHERE ${requestFilters.join(' AND ')}` : '';
  const transactionsWhereClause = transactionFilters.length > 0 ? `WHERE ${transactionFilters.join(' AND ')}` : '';

  const [requests, devices, employees, inventory, finance] = await Promise.all([
    dbGet<DashboardRequestsStats>(
      `
        SELECT
          COUNT(*) as total,
          COALESCE(SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END), 0) as new_count,
          COALESCE(SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END), 0) as in_progress_count,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) as completed_count,
          COALESCE(SUM(CASE WHEN status = 'waiting_parts' THEN 1 ELSE 0 END), 0) as waiting_count,
          COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelled_count
        FROM repair_requests
        ${requestsWhereClause}
      `,
      requestParams,
    ),
    dbAll<DeviceStatsRow>(
      `
        SELECT device_type, COUNT(*) as count
        FROM repair_requests
        ${requestsWhereClause}
        GROUP BY device_type
        ORDER BY count DESC, device_type ASC
      `,
      requestParams,
    ),
    dbAll<EmployeeStatsRow>(
      `
        SELECT
          e.id,
          e.name,
          e.completed_repairs,
          CAST(COALESCE(SUM(r.assigned_count), 0) AS INTEGER) as assigned_count
        FROM employees e
        LEFT JOIN (
          SELECT assigned_to, COUNT(*) as assigned_count
          FROM repair_requests
          WHERE assigned_to IS NOT NULL
            AND status NOT IN ('completed', 'cancelled')
          GROUP BY assigned_to
        ) r ON r.assigned_to = e.id OR r.assigned_to = e.name
        GROUP BY e.id, e.name, e.completed_repairs
        ORDER BY assigned_count DESC, e.name ASC
      `,
    ),
    dbGet<InventoryStatsRow>(
      `
        SELECT
          COUNT(*) as total_positions,
          COALESCE(SUM(quantity), 0) as total_units,
          SUM(CASE WHEN quantity > 0 AND quantity <= min_quantity THEN 1 ELSE 0 END) as low_stock_count,
          SUM(CASE WHEN quantity <= 0 THEN 1 ELSE 0 END) as out_of_stock_count
        FROM inventory
      `,
    ),
    dbGet<FinanceStatsRow>(
      `
        SELECT
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
        FROM transactions
        ${transactionsWhereClause}
      `,
      transactionParams,
    ),
  ]);

  const totalIncome = Number(finance?.total_income ?? 0);
  const totalExpenses = Number(finance?.total_expenses ?? 0);

  return sendSuccess(res, {
    requests: requests ?? {
      total: 0,
      new_count: 0,
      in_progress_count: 0,
      completed_count: 0,
      waiting_count: 0,
      cancelled_count: 0,
    },
    devices,
    employees,
    inventory: {
      total_positions: Number(inventory?.total_positions ?? 0),
      total_units: Number(inventory?.total_units ?? 0),
      low_stock_count: Number(inventory?.low_stock_count ?? 0),
      out_of_stock_count: Number(inventory?.out_of_stock_count ?? 0),
    },
    finance: {
      total_income: totalIncome,
      total_expenses: totalExpenses,
      profit: totalIncome - totalExpenses,
    },
    generated_at: new Date().toISOString(),
  });
});

export const getRequestStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query as StatsQuery;
  let query = `
    SELECT
      DATE(created_at) as date,
      COUNT(*) as count,
      status
    FROM repair_requests
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (startDate) {
    query += ' AND created_at >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND created_at <= ?';
    params.push(endDate);
  }

  query += ' GROUP BY DATE(created_at), status ORDER BY date DESC, status ASC';

  return sendSuccess(res, await dbAll<RequestTimelineRow>(query, params));
});
