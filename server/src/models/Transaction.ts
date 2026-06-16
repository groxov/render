import { randomUUID } from 'crypto';
import { dbAll, dbGet, dbRun } from '../database/db';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  request_id: string | null;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  request_id?: string;
}

export interface TransactionCreateInput {
  request_id?: string | null;
  type: TransactionType;
  description: string;
  amount: number;
  date?: string;
}

export interface TransactionUpdateInput {
  request_id?: string | null;
  type?: TransactionType;
  description?: string;
  amount?: number;
  date?: string;
}

export interface TransactionStats {
  total_income: number;
  total_expenses: number;
  income_count: number;
  expense_count: number;
}

export class TransactionModel {
  static async findAll(filters: TransactionFilters = {}): Promise<Transaction[]> {
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params: unknown[] = [];

    if (filters.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters.startDate) {
      query += ' AND date >= ?';
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      query += ' AND date <= ?';
      params.push(filters.endDate);
    }

    if (filters.request_id) {
      query += ' AND request_id = ?';
      params.push(filters.request_id);
    }

    query += ' ORDER BY date DESC';

    return dbAll<Transaction>(query, params);
  }

  static async findById(id: string): Promise<Transaction | null> {
    const result = await dbGet<Transaction>('SELECT * FROM transactions WHERE id = ?', [id]);
    return result ?? null;
  }

  static async findIncomeByRequestId(requestId: string): Promise<Transaction | null> {
    const result = await dbGet<Transaction>(
      `SELECT * FROM transactions
       WHERE request_id = ? AND type = 'income'
       ORDER BY created_at DESC
       LIMIT 1`,
      [requestId],
    );

    return result ?? null;
  }

  static async create(data: TransactionCreateInput): Promise<Transaction> {
    const id = randomUUID();
    const now = new Date().toISOString();

    await dbRun(
      `INSERT INTO transactions (id, request_id, type, description, amount, date, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.request_id || null,
        data.type,
        data.description,
        data.amount,
        data.date || now,
        now
      ]
    );

    const createdTransaction = await this.findById(id);

    if (!createdTransaction) {
      throw new Error('Не удалось получить созданную транзакцию');
    }

    return createdTransaction;
  }

  static async update(id: string, data: TransactionUpdateInput): Promise<Transaction | null> {
    const updates: string[] = [];
    const params: unknown[] = [];
    const mutableFields = ['request_id', 'type', 'description', 'amount', 'date'] as const;

    mutableFields.forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(data, key)) {
        return;
      }

      const value = data[key];
      updates.push(`${key} = ?`);
      params.push(value ?? null);
    });

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);

    await dbRun(`UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`, params);

    return this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const result = await dbRun('DELETE FROM transactions WHERE id = ?', [id]);
    return result.changes > 0;
  }

  static async deleteIncomeByRequestId(requestId: string): Promise<boolean> {
    const result = await dbRun(
      `DELETE FROM transactions
       WHERE request_id = ? AND type = 'income'`,
      [requestId],
    );
    return result.changes > 0;
  }

  static async getStats(startDate?: string, endDate?: string): Promise<TransactionStats> {
    let query = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
        COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
        COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
      FROM transactions
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    const stats = await dbGet<TransactionStats>(query, params);

    return (
      stats ?? {
        total_income: 0,
        total_expenses: 0,
        income_count: 0,
        expense_count: 0,
      }
    );
  }
}
