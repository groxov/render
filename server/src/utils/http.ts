import { NextFunction, Request, RequestHandler, Response } from 'express';

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    void Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      requestId: res.locals.requestId,
    },
  });
}

export function sendMessage(res: Response, message: string, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    meta: {
      requestId: res.locals.requestId,
    },
  });
}

export function getErrorPayload(error: unknown) {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      message: error.message,
    };
  }

  return {
    statusCode: 500,
    message: 'Внутренняя ошибка сервера',
  };
}
