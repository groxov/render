import { useMemo } from 'react';
import { RepairRequest } from '../types';

export type FocusState = 'overdue' | 'at_risk' | 'on_track';

export interface RequestFocusItem {
  request: RepairRequest;
  urgencyScore: number;
  rank: number;
  ageHours: number;
  ageLabel: string;
  deadline: Date;
  deadlineLabel: string;
  focusState: FocusState;
  recommendation: string;
  note: string;
}

interface RequestFocusSummary {
  openCount: number;
  overdueCount: number;
  atRiskCount: number;
  onTrackCount: number;
  unassignedCount: number;
  highPriorityCount: number;
  avgUrgencyScore: number;
}

export function useRequestFocus(requests: RepairRequest[]) {
  return useMemo(() => {
    const now = resolveOperationalNow(requests);
    const openRequests = requests.filter((request) => request.status !== 'completed' && request.status !== 'cancelled');

    const focusQueue = openRequests
      .map((request) => buildFocusItem(request, now))
      .sort((left, right) => {
        if (right.urgencyScore !== left.urgencyScore) {
          return right.urgencyScore - left.urgencyScore;
        }

        return left.request.createdAt.getTime() - right.request.createdAt.getTime();
      })
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

    const summary: RequestFocusSummary = {
      openCount: focusQueue.length,
      overdueCount: focusQueue.filter((item) => item.focusState === 'overdue').length,
      atRiskCount: focusQueue.filter((item) => item.focusState === 'at_risk').length,
      onTrackCount: focusQueue.filter((item) => item.focusState === 'on_track').length,
      unassignedCount: focusQueue.filter((item) => !item.request.assignedTo).length,
      highPriorityCount: focusQueue.filter((item) => item.request.priority === 'high').length,
      avgUrgencyScore:
        focusQueue.length > 0
          ? Math.round(focusQueue.reduce((sum, item) => sum + item.urgencyScore, 0) / focusQueue.length)
          : 0,
    };

    const focusLookup = new Map(focusQueue.map((item) => [item.request.id, item]));

    return {
      focusQueue,
      focusLookup,
      summary,
    };
  }, [requests]);
}

function buildFocusItem(request: RepairRequest, now: Date): Omit<RequestFocusItem, 'rank'> {
  const createdAt = request.createdAt;
  const ageHours = Math.max(1, Math.round((now.getTime() - createdAt.getTime()) / 36e5));
  const targetHours = getTargetHours(request);
  const deadline = new Date(createdAt.getTime() + targetHours * 36e5);
  const hoursLeft = Math.round((deadline.getTime() - now.getTime()) / 36e5);
  const progress = ageHours / targetHours;
  const focusState = resolveFocusState(hoursLeft, progress);
  const urgencyScore = resolveUrgencyScore(request, ageHours, progress, focusState);

  return {
    request,
    urgencyScore,
    ageHours,
    ageLabel: formatAgeLabel(ageHours),
    deadline,
    deadlineLabel: formatDeadlineLabel(deadline, focusState, hoursLeft),
    focusState,
    recommendation: resolveRecommendation(request),
    note: resolveFocusNote(request, focusState, hoursLeft),
  };
}

function getTargetHours(request: RepairRequest) {
  const matrix = {
    high: { new: 8, in_progress: 48, waiting_parts: 120 },
    medium: { new: 24, in_progress: 72, waiting_parts: 168 },
    low: { new: 48, in_progress: 120, waiting_parts: 240 },
  } as const;

  if (request.status === 'waiting_parts') {
    return matrix[request.priority].waiting_parts;
  }

  if (request.status === 'in_progress') {
    return matrix[request.priority].in_progress;
  }

  return matrix[request.priority].new;
}

function resolveFocusState(hoursLeft: number, progress: number): FocusState {
  if (hoursLeft < 0) {
    return 'overdue';
  }

  if (hoursLeft <= 12 || progress >= 0.85) {
    return 'at_risk';
  }

  return 'on_track';
}

function resolveUrgencyScore(
  request: RepairRequest,
  ageHours: number,
  progress: number,
  focusState: FocusState,
) {
  const priorityBase = {
    high: 54,
    medium: 34,
    low: 18,
  }[request.priority];

  const statusBase = {
    new: 18,
    in_progress: 10,
    waiting_parts: 6,
    completed: 0,
    cancelled: 0,
  }[request.status];

  const focusBonus = {
    overdue: 26,
    at_risk: 14,
    on_track: 0,
  }[focusState];

  const assignmentBonus = request.assignedTo ? 0 : 10;
  const ageBonus = Math.min(16, Math.floor(ageHours / 12) * 2);
  const progressBonus = Math.min(14, Math.round(progress * 12));

  return Math.max(0, Math.min(100, priorityBase + statusBase + focusBonus + assignmentBonus + ageBonus + progressBonus));
}

function resolveRecommendation(request: RepairRequest) {
  if (request.status === 'new' && !request.assignedTo) {
    return 'Назначить мастера и открыть диагностику';
  }

  if (request.status === 'new') {
    return 'Провести первичный разбор и оценку работ';
  }

  if (request.status === 'waiting_parts') {
    return 'Проверить поставку и связаться с клиентом по срокам';
  }

  if (request.priority === 'high') {
    return 'Держать в активной работе до закрытия';
  }

  return 'Сверить статус ремонта и следующий шаг';
}

function resolveFocusNote(request: RepairRequest, focusState: FocusState, hoursLeft: number) {
  if (focusState === 'overdue') {
    return 'Срок внимания уже вышел, заявку лучше поднять в приоритет сегодня.';
  }

  if (request.status === 'waiting_parts') {
    return hoursLeft <= 24
      ? 'Окно контроля по запчастям уже рядом, лучше обновить клиента заранее.'
      : 'Пока идет ожидание, но точку контроля лучше не отпускать.';
  }

  if (!request.assignedTo) {
    return 'Заявка остается без ответственного, поэтому легко теряется в очереди.';
  }

  return 'Сейчас заявка выглядит управляемо, но ее стоит держать в поле зрения.';
}

function formatAgeLabel(ageHours: number) {
  if (ageHours >= 24) {
    const days = Math.floor(ageHours / 24);
    const extraHours = ageHours % 24;
    return extraHours > 0 ? `${days} д ${extraHours} ч в очереди` : `${days} д в очереди`;
  }

  return `${ageHours} ч в очереди`;
}

function formatDeadlineLabel(deadline: Date, focusState: FocusState, hoursLeft: number) {
  if (focusState === 'overdue') {
    const overdueHours = Math.abs(hoursLeft);
    if (overdueHours >= 24) {
      return `Просрочено на ${Math.floor(overdueHours / 24)} д`;
    }

    return `Просрочено на ${overdueHours} ч`;
  }

  if (hoursLeft <= 24) {
    return `Контроль через ${Math.max(1, hoursLeft)} ч`;
  }

  if (hoursLeft <= 24 * 7) {
    return `Контроль через ${Math.ceil(hoursLeft / 24)} д`;
  }

  const dueDate = deadline.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
  const dueTime = deadline.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (focusState === 'at_risk') {
    return `Риск по сроку: ${dueDate}, ${dueTime}`;
  }

  return `Контроль до ${dueDate}, ${dueTime}`;
}

function resolveOperationalNow(requests: RepairRequest[]) {
  const actualNow = new Date();
  const timestamps = requests
    .map((request) => request.createdAt.getTime())
    .filter((timestamp) => Number.isFinite(timestamp));

  if (timestamps.length === 0) {
    return actualNow;
  }

  const latestTimestamp = Math.max(...timestamps);
  const hoursSinceLatest = (actualNow.getTime() - latestTimestamp) / 36e5;

  if (hoursSinceLatest <= 24 * 21) {
    return actualNow;
  }

  const openTimestamps = requests
    .filter((request) => request.status !== 'completed' && request.status !== 'cancelled')
    .map((request) => request.createdAt.getTime())
    .filter((timestamp) => Number.isFinite(timestamp));

  const referenceTimestamp = openTimestamps.length > 0 ? Math.max(...openTimestamps) : latestTimestamp;

  return new Date(referenceTimestamp + 24 * 36e5);
}
