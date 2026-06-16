import dotenv from 'dotenv';
import { ensureDemoData } from '../bootstrap/demoSeed';
import { initializeDatabase } from '../bootstrap/database';
import { closeDatabaseConnection } from './db';

dotenv.config();

async function seed() {
  try {
    await initializeDatabase();
    const result = await ensureDemoData({ force: true });
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Demo seed failed:', error);
    process.exitCode = 1;
  } finally {
    await closeDatabaseConnection();
  }
}

void seed();
