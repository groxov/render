import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { dbAll, dbGet, dbRun, getDatabaseDialect, verifyDatabaseConnection } from '../database/db';
import { ensureDemoData } from './demoSeed';
import { splitSqlStatements } from '../utils/sql';

const DEFAULT_ADMIN = {
  id: 'admin-001',
  username: 'admin',
  email: 'admin@kalakutsky-service.ru',
  password: 'admin123',
  name: 'Administrator',
} as const;

export async function initializeDatabase() {
  try {
    await verifyDatabaseConnection();
    await executeSchema();
    await ensureSchemaUpgrades();
    await ensureDefaultAdmin();
    await ensureInitialDemoData();
    console.log(`Database initialized (${getDatabaseDialect()})`);
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

async function ensureInitialDemoData() {
  if (process.env.AUTO_SEED_DEMO === 'false') {
    return;
  }

  const result = await ensureDemoData();
  if (result.seeded && result.counts) {
    console.log(
      `Demo data seeded: ${result.counts.clients} clients, ${result.counts.repairRequests} requests, ${result.counts.transactions} transactions`,
    );
  }
}

async function executeSchema() {
  const schemaPath = resolveSchemaPath();
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  const statements = splitSqlStatements(schema);

  for (const statement of statements) {
    if (!statement.trim()) {
      continue;
    }

    await dbRun(statement);
  }
}

function resolveSchemaPath() {
  const candidatePaths = [
    path.join(__dirname, '../database/schema.sql'),
    path.join(__dirname, '../../src/database/schema.sql'),
  ];

  const existingPath = candidatePaths.find((candidatePath) => fs.existsSync(candidatePath));

  if (!existingPath) {
    throw new Error(`Schema file not found: ${candidatePaths.join(', ')}`);
  }

  return existingPath;
}

async function ensureSchemaUpgrades() {
  const hasMinQuantity =
    getDatabaseDialect() === 'postgres'
      ? await hasPostgresColumn('inventory', 'min_quantity')
      : await hasSqliteColumn('inventory', 'min_quantity');

  if (!hasMinQuantity) {
    await dbRun('ALTER TABLE inventory ADD COLUMN min_quantity INTEGER NOT NULL DEFAULT 0');
  }
}

async function ensureDefaultAdmin() {
  const existingAdmin = await dbGet<{ id: string }>('SELECT id FROM users WHERE username = ? LIMIT 1', [
    DEFAULT_ADMIN.username,
  ]);

  if (existingAdmin) {
    console.log('Default admin already exists');
    return;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 10);

  await dbRun(
    `INSERT INTO users (id, username, email, password_hash, user_type, name)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      DEFAULT_ADMIN.id,
      DEFAULT_ADMIN.username,
      DEFAULT_ADMIN.email,
      passwordHash,
      'admin',
      DEFAULT_ADMIN.name,
    ],
  );

  console.log('Default admin created (login: admin, password: admin123)');
}

async function hasSqliteColumn(tableName: string, columnName: string) {
  const columns = await dbAll<{ name: string }>(`PRAGMA table_info(${tableName})`);
  return columns.some((column) => column.name === columnName);
}

async function hasPostgresColumn(tableName: string, columnName: string) {
  const result = await dbGet<{ exists: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = ?
          AND column_name = ?
      ) as exists
    `,
    [tableName, columnName],
  );

  return Boolean(result?.exists);
}
