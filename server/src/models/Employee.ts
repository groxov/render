import { randomUUID } from 'crypto';
import { dbAll, dbGet, dbRun } from '../database/db';

export interface Employee {
  id: string;
  name: string;
  position: string;
  specialization: string;
  phone: string;
  email: string | null;
  status: 'active' | 'inactive';
  completed_repairs: number;
  created_at: string;
  updated_at: string;
}

export interface EmployeeMutationInput {
  name: string;
  position: string;
  specialization: string;
  phone: string;
  email?: string | null;
  status?: Employee['status'];
}

export class EmployeeModel {
  static async findAll(): Promise<Employee[]> {
    return dbAll<Employee>(
      `SELECT * FROM employees
       ORDER BY CASE WHEN status = 'active' THEN 0 ELSE 1 END, name ASC`,
    );
  }

  static async findById(id: string): Promise<Employee | null> {
    const result = await dbGet<Employee>('SELECT * FROM employees WHERE id = ?', [id]);
    return result ?? null;
  }

  static async create(data: EmployeeMutationInput): Promise<Employee> {
    const id = randomUUID();
    const now = new Date().toISOString();

    await dbRun(
      `INSERT INTO employees (id, name, position, specialization, phone, email, status, completed_repairs, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.position,
        data.specialization,
        data.phone,
        data.email || null,
        data.status || 'active',
        0,
        now,
        now
      ]
    );

    const createdEmployee = await this.findById(id);

    if (!createdEmployee) {
      throw new Error('Не удалось получить созданного сотрудника');
    }

    return createdEmployee;
  }

  static async update(id: string, data: Partial<EmployeeMutationInput>): Promise<Employee | null> {
    const updates: string[] = [];
    const params: unknown[] = [];
    const mutableFields = ['name', 'position', 'specialization', 'phone', 'email', 'status'] as const;

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
      `UPDATE employees SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const result = await dbRun('DELETE FROM employees WHERE id = ?', [id]);
    return result.changes > 0;
  }

  static async adjustCompletedRepairs(id: string, delta: number): Promise<boolean> {
    if (delta === 0) {
      return true;
    }

    const now = new Date().toISOString();
    const result = await dbRun(
      `UPDATE employees
       SET completed_repairs = CASE
         WHEN completed_repairs + ? < 0 THEN 0
         ELSE completed_repairs + ?
       END,
       updated_at = ?
       WHERE id = ?`,
      [delta, delta, now, id],
    );

    return result.changes > 0;
  }
}
