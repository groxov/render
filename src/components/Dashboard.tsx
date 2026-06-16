import { RotateCcw } from 'lucide-react';
import { STATUS_GRADIENT_COLORS } from '../constants';
import { useRequests } from '../hooks/useRequests';
import { RepairRequest } from '../types';
import { DataStatusNotice } from './common/DataStatusNotice';
import { OperationsPulse } from './common/OperationsPulse';
import { PageIntro } from './common/PageIntro';
import { RequestFocusBoard } from './common/RequestFocusBoard';
import { StatCard } from './common/StatCard';
import { StatusBadge } from './common/StatusBadge';

interface DashboardProps {
  onViewRequest: (request: RepairRequest) => void;
}

export default function Dashboard({ onViewRequest }: DashboardProps) {
  const { requests, loading, error, refreshRequests, usingFallbackData, isApiEmpty } = useRequests();

  const totalRequests = requests.length;
  const newRequests = requests.filter((request) => request.status === 'new').length;
  const inProgress = requests.filter((request) => request.status === 'in_progress').length;
  const completed = requests.filter((request) => request.status === 'completed').length;
  const waitingParts = requests.filter((request) => request.status === 'waiting_parts').length;
  const cancelled = requests.filter((request) => request.status === 'cancelled').length;

  const statusData = [
    { name: 'Новые', value: newRequests, status: 'new' as const, percent: totalRequests > 0 ? (newRequests / totalRequests) * 100 : 0 },
    { name: 'В работе', value: inProgress, status: 'in_progress' as const, percent: totalRequests > 0 ? (inProgress / totalRequests) * 100 : 0 },
    { name: 'Ожидание', value: waitingParts, status: 'waiting_parts' as const, percent: totalRequests > 0 ? (waitingParts / totalRequests) * 100 : 0 },
    { name: 'Выполнено', value: completed, status: 'completed' as const, percent: totalRequests > 0 ? (completed / totalRequests) * 100 : 0 },
    { name: 'Отменено', value: cancelled, status: 'cancelled' as const, percent: totalRequests > 0 ? (cancelled / totalRequests) * 100 : 0 },
  ];

  const deviceData = requests.reduce((acc, request) => {
    const existing = acc.find((item) => item.name === request.deviceType);

    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: request.deviceType, value: 1 });
    }

    return acc;
  }, [] as { name: string; value: number }[]);

  const maxDeviceCount = Math.max(...deviceData.map((device) => device.value), 1);

  const recentRequests = [...requests]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  return (
    <div className="animate-fadeIn space-y-6">
      <PageIntro
        eyebrow="Операционная сводка"
        title="Дашборд сервисного центра"
        description="Ключевые показатели по заявкам, загрузке мастерской и последним обращениям."
        actions={
          <>
            <div className="app-panel-soft flex items-center gap-3 px-4 py-3 text-sm text-slate-600">
              <span className="app-kicker">Обновлено</span>
              <span>{new Date().toLocaleDateString('ru-RU')}</span>
            </div>
            <button type="button" onClick={refreshRequests} className="app-button-secondary">
              <RotateCcw className="h-4 w-4" />
              Обновить
            </button>
          </>
        }
      />

      {usingFallbackData ? (
        <DataStatusNotice
          variant="warning"
          title="Показан резервный журнал заявок"
          description={
            error ??
            'API сейчас недоступен, поэтому дашборд временно работает на демонстрационном наборе, чтобы команда не оставалась без ориентиров.'
          }
          action={
            <button type="button" onClick={refreshRequests} className="app-button-secondary">
              <RotateCcw className="h-4 w-4" />
              Повторить
            </button>
          }
        />
      ) : isApiEmpty ? (
        <DataStatusNotice
          title="В базе пока нет заявок"
          description="Дашборд уже готов к работе, но реальные метрики появятся после первого приема техники или импорта обращений."
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Всего заявок"
          value={totalRequests}
          description="Все обращения за текущий период"
          icon={
            <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Новые"
          value={newRequests}
          description="Требуют первичного разбора"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          icon={
            <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <StatCard
          title="В работе"
          value={inProgress}
          description="Уже назначены в мастерскую"
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          icon={
            <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Выполнено"
          value={completed}
          description="Завершенные обращения"
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
          icon={
            <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <OperationsPulse requests={requests} />

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="app-panel p-5 sm:p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="app-kicker">Статусы</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">Распределение по этапам</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {loading ? 'Загрузка...' : `${totalRequests} записей`}
            </span>
          </div>

          {totalRequests === 0 ? (
            <div className="app-panel-soft px-5 py-10 text-sm leading-6 text-slate-500">
              Когда появятся заявки, здесь сразу станет видно, где именно скапливается очередь по этапам.
            </div>
          ) : (
            <div className="space-y-4">
              {statusData.map((item) => (
                <div key={item.status}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <span className="text-slate-600">{item.name}</span>
                    <span className="font-semibold text-slate-900">{item.value}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${STATUS_GRADIENT_COLORS[item.status]}`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="app-panel p-5 sm:p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="app-kicker">Устройства</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">Чем загружена мастерская</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {deviceData.length} категорий
            </span>
          </div>

          {deviceData.length === 0 ? (
            <div className="app-panel-soft px-5 py-10 text-sm leading-6 text-slate-500">
              Разбивка по устройствам появится автоматически, когда в журнале будут реальные обращения.
            </div>
          ) : (
            <div className="space-y-4">
              {deviceData.map((item) => (
                <div key={item.name}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <span className="text-slate-600">{item.name}</span>
                    <span className="font-semibold text-slate-900">{item.value}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500"
                      style={{ width: `${(item.value / maxDeviceCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <RequestFocusBoard
        requests={requests}
        onSelectRequest={onViewRequest}
        title="Фокус дня по очереди"
        description="Алгоритм сам поднимает заявки, которые сильнее всего рискуют выпасть из ритма по сроку, приоритету и отсутствию ответственного."
      />

      <div className="app-panel overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
          <p className="app-kicker">Лента</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">Последние заявки</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {recentRequests.length > 0 ? (
            recentRequests.map((request, index) => (
              <div
                key={request.id}
                onClick={() => onViewRequest(request)}
                className="cursor-pointer px-5 py-4 transition duration-200 hover:bg-slate-50/80 sm:px-6"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-slate-950">#{request.id}</span>
                      <span className="hidden text-slate-300 sm:inline">•</span>
                      <span className="text-base text-slate-700">
                        {request.deviceType} {request.deviceModel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {request.clientName} • {request.clientPhone}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{request.problem}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <StatusBadge status={request.status} />
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {request.createdAt.toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-16 text-center">
              <svg className="mx-auto mb-4 h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-slate-500">Пока нет заявок для отображения.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
