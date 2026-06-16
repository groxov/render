import { ApiResponse } from '../../types';
import { getAuthToken } from '../../lib/session';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api');
const API_REQUEST_TIMEOUT_MS = 12000;

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  const controller = new AbortController();
  const cleanupExternalSignal = bindExternalAbortSignal(options.signal, controller);
  const timeoutId = window.setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    const payload = await readApiPayload<T>(response);

    if (!response.ok) {
      throw new Error(resolveResponseErrorMessage(response.status, payload));
    }

    return payload;
  } catch (error) {
    const normalizedMessage = resolveRequestErrorMessage(error);
    console.error(`API request failed on ${endpoint}:`, error);
    throw new Error(normalizedMessage);
  } finally {
    window.clearTimeout(timeoutId);
    cleanupExternalSignal();
  }
}

export function createQueryString(params: object) {
  const query = new URLSearchParams();

  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    ) {
      query.append(key, String(value));
    }
  });

  return query.toString();
}

async function readApiPayload<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();

  return {
    success: response.ok,
    data: undefined as T,
    error: text || undefined,
  };
}

function resolveResponseErrorMessage<T>(status: number, payload: ApiResponse<T>) {
  if (payload && typeof payload.error === 'string' && payload.error.trim().length > 0) {
    return payload.error;
  }

  if (status >= 500) {
    return 'Сервер временно недоступен. Попробуйте повторить запрос чуть позже.';
  }

  if (status === 404) {
    return 'Запрошенный API-метод не найден.';
  }

  if (status === 401) {
    return 'Сессия недействительна. Повторите вход в систему.';
  }

  return `Ошибка запроса (${status})`;
}

function resolveRequestErrorMessage(error: unknown) {
  if (error instanceof Error && error.name === 'AbortError') {
    return 'Сервер отвечает слишком долго. Проверьте backend и повторите запрос.';
  }

  if (error instanceof TypeError) {
    return 'Не удалось подключиться к API. Проверьте, что backend запущен и доступен по сети.';
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Не удалось выполнить запрос к API.';
}

function bindExternalAbortSignal(signal: AbortSignal | null | undefined, controller: AbortController) {
  if (!signal) {
    return () => {};
  }

  const abortHandler = () => controller.abort();
  signal.addEventListener('abort', abortHandler);

  return () => signal.removeEventListener('abort', abortHandler);
}
