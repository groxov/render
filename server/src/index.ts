import dotenv from 'dotenv';
import { Server } from 'http';
import { createApp } from './app';
import { initializeDatabase } from './bootstrap/database';
import { closeDatabaseConnection } from './database/db';

dotenv.config();

const PORT = Number(process.env.PORT || 3001);
let activeServer: Server | null = null;
let shuttingDown = false;

async function startServer() {
  await initializeDatabase();
  const app = createApp();

  const server = app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
  });

  server.on('error', (error) => {
    console.error('Ошибка HTTP-сервера:', error);
  });

  activeServer = server;

  return app;
}

async function shutdown(signal: string) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log(`Получен сигнал ${signal}, останавливаем backend...`);

  try {
    await new Promise<void>((resolve, reject) => {
      if (!activeServer) {
        resolve();
        return;
      }

      activeServer.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    await closeDatabaseConnection();
    process.exit(0);
  } catch (error) {
    console.error('Ошибка graceful shutdown:', error);
    process.exit(1);
  }
}

const appPromise = startServer().catch((error) => {
  console.error('Ошибка старта сервера:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

export default appPromise;
