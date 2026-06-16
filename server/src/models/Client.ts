import { randomUUID } from 'crypto';
import { dbAll, dbGet, dbRun } from '../database/db';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientMutationInput {
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
}

export class ClientModel {
  static async findAll(): Promise<Client[]> {
    return dbAll<Client>('SELECT * FROM clients ORDER BY updated_at DESC, created_at DESC');
  }

  static async findById(id: string): Promise<Client | null> {
    const result = await dbGet<Client>('SELECT * FROM clients WHERE id = ?', [id]);
    return result ?? null;
  }

  static async findByPhone(phone: string): Promise<Client | null> {
    const result = await dbGet<Client>('SELECT * FROM clients WHERE phone = ? LIMIT 1', [phone]);
    return result ?? null;
  }

  static async create(data: ClientMutationInput): Promise<Client> {
    const id = randomUUID();
    const now = new Date().toISOString();

    await dbRun(
      `INSERT INTO clients (id, name, phone, email, address, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.phone,
        data.email || null,
        data.address || null,
        data.notes || null,
        now,
        now
      ]
    );

    const createdClient = await this.findById(id);

    if (!createdClient) {
      throw new Error('Не удалось получить созданного клиента');
    }

    return createdClient;
  }

  static async update(id: string, data: Partial<ClientMutationInput>): Promise<Client | null> {
    const updates: string[] = [];
    const params: unknown[] = [];
    const mutableFields = ['name', 'phone', 'email', 'address', 'notes'] as const;

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
      `UPDATE clients SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const result = await dbRun('DELETE FROM clients WHERE id = ?', [id]);
    return result.changes > 0;
  }
}
