import { RepairRequestModel } from '../models/RepairRequest';
import { TransactionModel } from '../models/Transaction';
import { ApiError, asyncHandler, sendMessage, sendSuccess } from '../utils/http';

interface FinanceQuery {
  type?: 'income' | 'expense';
  startDate?: string;
  endDate?: string;
  request_id?: string;
}

interface TransactionPayload {
  request_id?: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date?: string;
}

export const getTransactions = asyncHandler(async (req, res) => {
  const { type, startDate, endDate, request_id } = req.query as FinanceQuery;

  return sendSuccess(
    res,
    await TransactionModel.findAll({
      type,
      startDate,
      endDate,
      request_id,
    }),
  );
});

export const getFinanceStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query as FinanceQuery;
  const stats = await TransactionModel.getStats(startDate, endDate);

  const totalIncome = Number(stats.total_income ?? 0);
  const totalExpenses = Number(stats.total_expenses ?? 0);
  const profit = totalIncome - totalExpenses;
  const margin = totalIncome > 0 ? Number(((profit / totalIncome) * 100).toFixed(1)) : 0;
  const avgCheck = stats.income_count > 0 ? Math.round(totalIncome / stats.income_count) : 0;

  return sendSuccess(res, {
    totalIncome,
    totalExpenses,
    profit,
    margin,
    avgCheck,
    incomeCount: Number(stats.income_count ?? 0),
    expenseCount: Number(stats.expense_count ?? 0),
  });
});

export const createTransaction = asyncHandler(async (req, res) => {
  const payload = req.body as TransactionPayload;

  if (payload.request_id) {
    const request = await RepairRequestModel.findById(payload.request_id);

    if (!request) {
      throw new ApiError(400, 'Связанная заявка не найдена');
    }
  }

  return sendSuccess(
    res,
    await TransactionModel.create({
      request_id: payload.request_id,
      type: payload.type,
      description: payload.description,
      amount: payload.amount,
      date: payload.date,
    }),
    201,
  );
});

export const deleteTransaction = asyncHandler(async (req, res) => {
  const deleted = await TransactionModel.delete(req.params.id);

  if (!deleted) {
    throw new ApiError(404, 'Транзакция не найдена');
  }

  return sendMessage(res, 'Транзакция удалена');
});

