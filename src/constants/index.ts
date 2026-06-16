import { RequestStatus, Priority } from '../types';

export const STATUS_LABELS: Record<RequestStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  waiting_parts: 'Ожидание запчастей',
  completed: 'Выполнено',
  cancelled: 'Отменено',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

export const STATUS_COLORS: Record<RequestStatus, string> = {
  new: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  waiting_parts: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

export const STATUS_GRADIENT_COLORS: Record<RequestStatus, string> = {
  new: 'from-[#9810fa] to-[#155dfc]',
  in_progress: 'from-[#f59e0b] to-[#d97706]',
  waiting_parts: 'from-[#8b5cf6] to-[#7c3aed]',
  completed: 'from-[#10b981] to-[#059669]',
  cancelled: 'from-[#ef4444] to-[#dc2626]',
};

export const DEVICE_TYPES = [
  'Ноутбук',
  'Компьютер',
  'Смартфон',
  'Планшет',
  'Принтер',
  'Монитор',
  'Другое',
] as const;


