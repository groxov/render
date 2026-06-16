import { randomUUID } from 'crypto';
import { dbAll, dbGet, dbRun } from '../database/db';

export type RepairRequestStatus = 'new' | 'in_progress' | 'waiting_parts' | 'completed' | 'cancelled';
export type RepairRequestPriority = 'low' | 'medium' | 'high';

export interface RepairRequest {
  id: string;
  client_id: string | null;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  device_type: string;
  device_model: string;
  serial_number: string | null;
  problem: string;
  status: RepairRequestStatus;
  priority: RepairRequestPriority;
  assigned_to: string | null;
  assigned_to_name?: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface RepairRequestFilters {
  status?: RepairRequestStatus;
  assigned_to?: string;
}

export interface RepairRequestCreateInput {
  client_id?: string | null;
  client_name: string;
  client_phone: string;
  client_email?: string | null;
  device_type: string;
  device_model: string;
  serial_number?: string | null;
  problem: string;
  status?: RepairRequestStatus;
  priority?: RepairRequestPriority;
  assigned_to?: string | null;
  estimated_cost?: number | null;
  actual_cost?: number | null;
  notes?: string | null;
  completed_at?: string | null;
}

export class RepairRequestModel {
  static async findAll(filters: RepairRequestFilters = {}): Promise<RepairRequest[]> {
    let query = `
      SELECT rr.*, e.name as assigned_to_name
      FROM repair_requests rr
      LEFT JOIN employees e ON e.id = rr.assigned_to
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (filters.status) {
      query += ' AND rr.status = ?';
      params.push(filters.status);
    }

    if (filters.assigned_to) {
      query += ' AND rr.assigned_to = ?';
      params.push(filters.assigned_to);
    }

    query += ' ORDER BY rr.created_at DESC';

    return dbAll<RepairRequest>(query, params);
  }

  static async findById(id: string): Promise<RepairRequest | null> {
    const result = await dbGet<RepairRequest>(
      `SELECT rr.*, e.name as assigned_to_name
       FROM repair_requests rr
       LEFT JOIN employees e ON e.id = rr.assigned_to
       WHERE rr.id = ?`,
      [id],
    );
    return result ?? null;
  }

  static async create(data: RepairRequestCreateInput): Promise<RepairRequest> {
    const id = generateRequestId();
    const now = new Date().toISOString();

    await dbRun(
      `INSERT INTO repair_requests 
       (id, client_id, client_name, client_phone, client_email, device_type, device_model, 
        serial_number, problem, status, priority, assigned_to, estimated_cost, actual_cost, notes, created_at, updated_at, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.client_id ?? null,
        data.client_name,
        data.client_phone,
        data.client_email ?? null,
        data.device_type,
        data.device_model,
        data.serial_number ?? null,
        data.problem,
        data.status ?? 'new',
        data.priority ?? 'medium',
        data.assigned_to ?? null,
        data.estimated_cost ?? null,
        data.actual_cost ?? null,
        data.notes ?? null,
        now,
        now,
        data.completed_at ?? null,
      ]
    );

    const createdRequest = await this.findById(id);

    if (!createdRequest) {
      throw new Error('Не удалось получить созданную заявку');
    }

    return createdRequest;
  }

  static async update(id: string, data: Partial<RepairRequest>): Promise<RepairRequest | null> {
    const updates: string[] = [];
    const params: unknown[] = [];
    const mutableFields = [
      'client_id',
      'client_name',
      'client_phone',
      'client_email',
      'device_type',
      'device_model',
      'serial_number',
      'problem',
      'status',
      'priority',
      'assigned_to',
      'estimated_cost',
      'actual_cost',
      'notes',
      'completed_at',
    ] as const;

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
    params.push(new Date().toISOString());
    params.push(id);

    await dbRun(
      `UPDATE repair_requests SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const result = await dbRun('DELETE FROM repair_requests WHERE id = ?', [id]);
    return result.changes > 0;
  }
}

function generateRequestId() {
  const year = new Date().getFullYear();
  const uuidPart = randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
  return `${year}-${uuidPart}`;
}
