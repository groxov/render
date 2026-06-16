import { AsyncLocalStorage } from 'async_hooks';
import fs from 'fs';
import path from 'path';
import { Pool, PoolClient, QueryResultRow, types as pgTypes } from 'pg';
import sqlite3 from 'sqlite3';

export type DatabaseDialect = 'sqlite' | 'postgres';

export interface DbRunResult {
  changes: number;
}

type QueryParams = unknown[];

const SQLITE_DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../database/kalakutsky.db');
const DATABASE_DIALECT = resolveDialect();

const pgTransactionStore = new AsyncLocalStorage<PoolClient>();
const sqliteTransactionStore = new AsyncLocalStorage<boolean>();
const NORMALIZED_QUERY_CACHE_LIMIT = 500;
const normalizedPostgresQueryCache = new Map<string, string>();
let postgresPool: Pool | null = null;
let sqliteDatabase: sqlite3.Database | null = null;

pgTypes.setTypeParser(20, (value) => Number(value));

function resolveDialect(): DatabaseDialect {
  if (process.env.DB_CLIENT === 'postgres' || process.env.DATABASE_URL) {
    return 'postgres';
  }

  return 'sqlite';
}

function getPostgresPool() {
  if (!postgresPool) {
    postgresPool = new Pool({
      ...(process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
          }
        : {
            host: process.env.PGHOST || '127.0.0.1',
            port: Number(process.env.PGPORT || 5432),
            database: process.env.PGDATABASE || 'kalakutsky_repair',
            user: process.env.PGUSER || 'postgres',
            password: process.env.PGPASSWORD || 'postgres',
          }),
      ssl: getPostgresSslConfig(),
      max: Number(process.env.PG_POOL_MAX || 10),
    });

    postgresPool.on('error', (error) => {
      console.error('Ошибка пула PostgreSQL:', error);
    });
  }

  return postgresPool;
}

function getSqliteDatabase() {
  if (!sqliteDatabase) {
    const dbDir = path.dirname(SQLITE_DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    sqliteDatabase = new sqlite3.Database(SQLITE_DB_PATH, (error) => {
      if (error) {
        console.error('Ошибка подключения к SQLite базе данных:', error);
      } else {
        console.log(`Подключено к SQLite базе данных: ${SQLITE_DB_PATH}`);
      }
    });

    sqliteDatabase.serialize(() => {
      sqliteDatabase?.run('PRAGMA foreign_keys = ON');
      sqliteDatabase?.run('PRAGMA journal_mode = WAL');
      sqliteDatabase?.run('PRAGMA busy_timeout = 5000');
    });
  }

  return sqliteDatabase;
}

function getPostgresSslConfig() {
  if (process.env.PG_SSL !== 'true') {
    return false;
  }

  return {
    rejectUnauthorized: process.env.PG_SSL_REJECT_UNAUTHORIZED !== 'false',
  };
}

function normalizePostgresQuery(query: string) {
  if (!query.includes('?')) {
    return query;
  }

  const cachedQuery = normalizedPostgresQueryCache.get(query);
  if (cachedQuery) {
    return cachedQuery;
  }

  let placeholderIndex = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let result = '';

  for (let index = 0; index < query.length; index += 1) {
    const char = query[index];
    const previousChar = query[index - 1];

    if (char === "'" && !inDoubleQuote && previousChar !== '\\') {
      inSingleQuote = !inSingleQuote;
      result += char;
      continue;
    }

    if (char === '"' && !inSingleQuote && previousChar !== '\\') {
      inDoubleQuote = !inDoubleQuote;
      result += char;
      continue;
    }

    if (char === '?' && !inSingleQuote && !inDoubleQuote) {
      placeholderIndex += 1;
      result += `$${placeholderIndex}`;
      continue;
    }

    result += char;
  }

  rememberNormalizedPostgresQuery(query, result);
  return result;
}

function rememberNormalizedPostgresQuery(query: string, normalizedQuery: string) {
  if (normalizedPostgresQueryCache.size >= NORMALIZED_QUERY_CACHE_LIMIT) {
    const oldestQuery = normalizedPostgresQueryCache.keys().next().value;
    if (oldestQuery) {
      normalizedPostgresQueryCache.delete(oldestQuery);
    }
  }

  normalizedPostgresQueryCache.set(query, normalizedQuery);
}

async function postgresQuery<T extends QueryResultRow = QueryResultRow>(query: string, params: QueryParams = []) {
  const executor = pgTransactionStore.getStore() ?? getPostgresPool();
  return executor.query<T>(normalizePostgresQuery(query), params);
}

async function sqliteRun(query: string, params: QueryParams = []) {
  const db = getSqliteDatabase();

  return new Promise<DbRunResult>((resolve, reject) => {
    db.run(query, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({
        changes: this.changes ?? 0,
      });
    });
  });
}

async function sqliteGet<T = unknown>(query: string, params: QueryParams = []) {
  const db = getSqliteDatabase();

  return new Promise<T | undefined>((resolve, reject) => {
    db.get(query, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row as T | undefined);
    });
  });
}

async function sqliteAll<T = unknown>(query: string, params: QueryParams = []) {
  const db = getSqliteDatabase();

  return new Promise<T[]>((resolve, reject) => {
    db.all(query, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve((rows as T[]) || []);
    });
  });
}

export function getDatabaseDialect(): DatabaseDialect {
  return DATABASE_DIALECT;
}

export async function verifyDatabaseConnection() {
  if (DATABASE_DIALECT === 'postgres') {
    const result = await postgresQuery<{ current_database: string }>(
      'SELECT current_database() as current_database',
    );

    console.log(`Подключено к PostgreSQL базе данных: ${result.rows[0]?.current_database ?? 'unknown'}`);
    return;
  }

  getSqliteDatabase();
}

export async function pingDatabase() {
  if (DATABASE_DIALECT === 'postgres') {
    const result = await postgresQuery<{ ok: number }>('SELECT 1 as ok');
    return result.rows[0]?.ok === 1;
  }

  const result = await sqliteGet<{ ok: number }>('SELECT 1 as ok');
  return result?.ok === 1;
}

export async function dbRun(query: string, params: QueryParams = []) {
  if (DATABASE_DIALECT === 'postgres') {
    const result = await postgresQuery(query, params);
    return {
      changes: result.rowCount ?? 0,
    } satisfies DbRunResult;
  }

  return sqliteRun(query, params);
}

export async function dbExec(query: string) {
  if (DATABASE_DIALECT === 'postgres') {
    await postgresQuery(query);
    return;
  }

  const db = getSqliteDatabase();

  return new Promise<void>((resolve, reject) => {
    db.exec(query, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

export async function dbGet<T = unknown>(query: string, params: QueryParams = []) {
  if (DATABASE_DIALECT === 'postgres') {
    const result = await postgresQuery(query, params);
    return result.rows[0] as T | undefined;
  }

  return sqliteGet<T>(query, params);
}

export async function dbAll<T = unknown>(query: string, params: QueryParams = []) {
  if (DATABASE_DIALECT === 'postgres') {
    const result = await postgresQuery(query, params);
    return result.rows as T[];
  }

  return sqliteAll<T>(query, params);
}

export async function dbTransaction<T>(operation: () => Promise<T>) {
  if (DATABASE_DIALECT === 'postgres') {
    const activeTransaction = pgTransactionStore.getStore();
    if (activeTransaction) {
      return operation();
    }

    const client = await getPostgresPool().connect();

    try {
      await client.query('BEGIN');

      return await pgTransactionStore.run(client, async () => {
        try {
          const result = await operation();
          await client.query('COMMIT');
          return result;
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
      });
    } finally {
      client.release();
    }
  }

  if (sqliteTransactionStore.getStore()) {
    return operation();
  }

  await dbRun('BEGIN IMMEDIATE');

  try {
    const result = await sqliteTransactionStore.run(true, operation);
    await dbRun('COMMIT');
    return result;
  } catch (error) {
    try {
      await dbRun('ROLLBACK');
    } catch (rollbackError) {
      console.error('Ошибка rollback:', rollbackError);
    }

    throw error;
  }
}

export async function closeDatabaseConnection() {
  const tasks: Array<Promise<void>> = [];

  if (postgresPool) {
    const pool = postgresPool;
    postgresPool = null;
    tasks.push(pool.end().then(() => undefined));
  }

  if (sqliteDatabase) {
    const database = sqliteDatabase;
    sqliteDatabase = null;
    tasks.push(
      new Promise<void>((resolve, reject) => {
        database.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      }),
    );
  }

  await Promise.all(tasks);
}
