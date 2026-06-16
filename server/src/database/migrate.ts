import { initializeDatabase } from '../bootstrap/database';

async function migrate() {
  try {
    await initializeDatabase();
    console.log('Миграция базы данных выполнена успешно');
    process.exit(0);
  } catch (error) {
    console.error('Ошибка миграции:', error);
    process.exit(1);
  }
}

void migrate();
