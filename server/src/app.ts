import { randomUUID } from 'crypto';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { getDatabaseDialect, pingDatabase } from './database/db';
import routes from './routes';
import { getErrorPayload } from './utils/http';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors());
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use((req, res, next) => {
    const requestId = randomUUID();
    res.locals.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
  });

  app.get('/health', async (req, res, next) => {
    try {
      const databaseOk = await pingDatabase();

      res.json({
        success: true,
        data: {
          status: databaseOk ? 'ok' : 'degraded',
          timestamp: new Date().toISOString(),
          uptimeSeconds: Math.round(process.uptime()),
          database: {
            dialect: getDatabaseDialect(),
            connected: databaseOk,
          },
          env: process.env.NODE_ENV || 'development',
        },
        meta: {
          requestId: res.locals.requestId,
        },
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/', (req, res) => {
    res.json({
      success: true,
      data: {
        name: 'Kalakutsky Service Backend API',
        endpoints: {
          health: '/health',
          api: '/api',
        },
      },
      meta: {
        requestId: res.locals.requestId,
      },
    });
  });

  app.use('/api', routes);

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint не найден',
      meta: {
        requestId: res.locals.requestId,
      },
    });
  });

  app.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const payload = getErrorPayload(error);

    console.error(`[${res.locals.requestId ?? 'no-request-id'}] Error:`, error);

    res.status(payload.statusCode).json({
      success: false,
      error: payload.message || 'Внутренняя ошибка сервера',
      ...(payload.details ? { details: payload.details } : {}),
      meta: {
        requestId: res.locals.requestId,
      },
    });
  });

  return app;
}
