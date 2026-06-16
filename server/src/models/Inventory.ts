import { randomUUID } from 'crypto';
import { dbAll, dbGet, dbRun } from '../database/db';

export type InventoryStockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  min_quantity: number;
  unit_price: number | null;
  supplier: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  status: InventoryStockStatus;
}

export interface InventoryFilters {
  search?: string;
  category?: string;
  status?: InventoryStockStatus;
}

export interface InventoryMutationInput {
  name: string;
  category: string;
  quantity?: number;
  min_quantity?: number;
  unit_price?: number | null;
  supplier?: string | null;
  notes?: string | null;
}

export class InventoryModel {
  static async findAll(filters: InventoryFilters = {}) {
    let query = `
      SELECT 
        id,
        name,
        category,
        quantity,
        min_quantity,
        unit_price,
        supplier,
        notes,
        created_at,
        updated_at,
        CASE
          WHEN quantity <= 0 THEN 'out_of_stock'
          WHEN quantity <= min_quantity THEN 'low_stock'
          ELSE 'in_stock'
        END as status
      FROM inventory
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (filters.search) {
      query += ' AND (LOWER(name) LIKE LOWER(?) OR LOWER(category) LIKE LOWER(?) OR LOWER(COALESCE(supplier, \'\')) LIKE LOWER(?))';
      const value = `%${filters.search}%`;
      params.push(value, value, value);
    }

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.status) {
      query += `
        AND CASE
          WHEN quantity <= 0 THEN 'out_of_stock'
          WHEN quantity <= min_quantity THEN 'low_stock'
          ELSE 'in_stock'
        END = ?
      `;
      params.push(filters.status);
    }

    query += ' ORDER BY category ASC, name ASC';

    return dbAll<InventoryItem>(query, params);
  }

  static async findById(id: string): Promise<InventoryItem | null> {
    const result = await dbGet<InventoryItem>(
      `
        SELECT 
          id,
          name,
          category,
          quantity,
          min_quantity,
          unit_price,
          supplier,
          notes,
          created_at,
          updated_at,
          CASE
            WHEN quantity <= 0 THEN 'out_of_stock'
            WHEN quantity <= min_quantity THEN 'low_stock'
            ELSE 'in_stock'
          END as status
        FROM inventory
        WHERE id = ?
      `,
      [id],
    );

    return result ?? null;
  }

  static async create(data: InventoryMutationInput): Promise<InventoryItem> {
    const id = randomUUID();
    const now = new Date().toISOString();

    await dbRun(
      `INSERT INTO inventory 
       (id, name, category, quantity, min_quantity, unit_price, supplier, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.category,
        data.quantity ?? 0,
        data.min_quantity ?? 0,
        data.unit_price ?? null,
        data.supplier ?? null,
        data.notes ?? null,
        now,
        now,
      ],
    );

    const createdItem = await this.findById(id);

    if (!createdItem) {
      throw new Error('Не удалось получить созданную складскую позицию');
    }

    return createdItem;
  }

  static async update(id: string, data: Partial<InventoryMutationInput>): Promise<InventoryItem | null> {
    const updates: string[] = [];
    const params: unknown[] = [];
    const mutableFields = ['name', 'category', 'quantity', 'min_quantity', 'unit_price', 'supplier', 'notes'] as const;

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

    updates.push('updated_at = ?');
    params.push(new Date().toISOString(), id);

    await dbRun(`UPDATE inventory SET ${updates.join(', ')} WHERE id = ?`, params);

    return this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const result = await dbRun('DELETE FROM inventory WHERE id = ?', [id]);
    return result.changes > 0;
  }
}
