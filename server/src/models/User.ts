import { randomUUID } from 'crypto';
import { dbGet, dbRun } from '../database/db';

export interface UserRecord {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  user_type: 'admin' | 'user';
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  username: string;
  email: string;
  password_hash: string;
  user_type: 'admin' | 'user';
  name?: string | null;
}

export class UserModel {
  static async findByLogin(login: string): Promise<UserRecord | null> {
    const result = await dbGet<UserRecord>(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [login, login],
    );

    return result ?? null;
  }

  static async findByUsernameOrEmail(username: string, email: string): Promise<UserRecord | null> {
    const result = await dbGet<UserRecord>(
      'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1',
      [username, email],
    );

    return result ?? null;
  }

  static async create(data: CreateUserInput): Promise<UserRecord> {
    const id = randomUUID();
    const now = new Date().toISOString();

    await dbRun(
      `INSERT INTO users (id, username, email, password_hash, user_type, name, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.username,
        data.email,
        data.password_hash,
        data.user_type,
        data.name ?? null,
        now,
        now,
      ],
    );

    const createdUser = await dbGet<UserRecord>('SELECT * FROM users WHERE id = ?', [id]);

    if (!createdUser) {
      throw new Error('Не удалось получить созданного пользователя');
    }

    return createdUser;
  }
}
