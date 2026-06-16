import { CalendarDays, Clock3, Layers3, TimerReset } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRequests } from '../hooks/useRequests';
import { RepairRequest } from '../types';
import { DataStatusNotice } from './common/DataStatusNotice';
import { PageIntro } from './common/PageIntro';
import { RequestFocusBoard } from './common/RequestFocusBoard';
import { StatCard } from './common/StatCard';
import { StatusBadge } from './common/StatusBadge';

interface CalendarPageProps {
  onViewRequest?: (request: RepairRequest) => void;
}

export default function CalendarPage({ onViewRequest }: CalendarPageProps) {
  const { requests, loading, error, usingFallbackData, isApiEmpty } = useRequests();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthAnchor = useMemo(() => {
    const latestRequest = [...requests].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0];
    return latestRequest?.createdAt ?? new Date();
  }, [requests]);

  const monthStats = useMemo(() => {
    const currentMonth = monthAnchor.getMonth();
    const currentYear = monthAnchor.getFullYear();

    return requests.filter(
      (request) => request.createdAt.getMonth() === currentMonth && request.createdAt.getFullYear() === currentYear,
    );
  }, [monthAnchor, requests]);

  const requestsByDay = useMemo(() => {
    const map = new Map<string, typeof requests>();

    monthStats.forEach((request) => {
      const key = toDateKey(request.createdAt);
      const current = map.get(key) ?? [];
      current.push(request);
      map.set(key, current);
    });

    return map;
  }, [monthStats]);

  const activeDateKey = selectedDate ?? Array.from(requestsByDay.keys()).sort().reverse()[0] ?? toDateKey(monthAnchor);
  const selectedDayRequests = [...(requestsByDay.get(activeDateKey) ?? [])].sort(
    (left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
  );

  const calendarCells = useMemo(() => {
    const year = monthAnchor.getFullYear();
    const month = monthAnchor.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstWeekday = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ key: string; label: number; requestsCount: number } | null> = [];

    for (let index = 0; index < firstWeekday; index += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      const key = toDateKey(date);
      cells.push({
        key,
        label: day,
        requestsCount: requestsByDay.get(key)?.length ?? 0,
      });
    }

    return cells;
  }, [monthAnchor, requestsByDay]);

  const totalEvents = monthStats.length;
  const busyDays = Array.from(requestsByDay.values()).filter((items) => items.length > 0).length;
  const highPriority = monthStats.filter((request) => request.priority === 'high').length;
  const waitingParts = monthStats.filter((request) => request.status === 'waiting_parts').length;
  const hasActivityInMonth = calendarCells.some((cell) => cell && cell.requestsCount > 0);

  return (
    <div className="animate-fadeIn space-y-6">
      <PageIntro
        eyebrow="Календарная лента"
        title="Планирование и загрузка команды"
        description="Календарь строится из текущих заявок: видно, в какие дни был поток обращений, а справа сразу раскрывается список работ по выбранной дате."
        actions={
          <div className="app-panel-soft flex items-center gap-3 px-4 py-3 text-sm text-slate-600">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            <span>{formatMonthTitle(monthAnchor)}</span>
          </div>
        }
      />

      {usingFallbackData ? (
        <DataStatusNotice
          variant="warning"
          title="Календарь работает на резервной ленте"
          description={error ?? 'Сейчас API не отдал актуальные заявки, поэтому календарь построен по демонстрационному набору обращений.'}
        />
      ) : isApiEmpty ? (
        <DataStatusNotice
          title="Календарная сетка пока пустая"
          description="Как только появятся первые заявки, здесь сразу будет видно, в какие дни пришел поток техники и где скапливается нагрузка."
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Событий за месяц"
          value={loading ? '...' : totalEvents}
          description="Обращения в выбранном месяце"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          icon={<CalendarDays className="h-full w-full" />}
        />
        <StatCard
          title="Загруженных дней"
          value={loading ? '...' : busyDays}
          description="Даты с обращениями"
          iconBgColor="bg-violet-100"
          iconColor="text-violet-600"
          icon={<Layers3 className="h-full w-full" />}
        />
        <StatCard
          title="Высокий приоритет"
          value={loading ? '...' : highPriority}
          description="Срочные обращения в месяце"
          iconBgColor="bg-rose-100"
          iconColor="text-rose-600"
          icon={<TimerReset className="h-full w-full" />}
        />
        <StatCard
          title="Ожидают запчасти"
          value={loading ? '...' : waitingParts}
          description="Работы с паузой по деталям"
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          icon={<Clock3 className="h-full w-full" />}
        />
      </div>

      <RequestFocusBoard
        requests={requests}
        onSelectRequest={onViewRequest}
        maxItems={4}
        title="Что стоит удержать сегодня"
        description="Календарь показывает историю потока обращений, а этот блок подсказывает, какие открытые заявки лучше не выпускать из поля зрения прямо сейчас."
      />

      <div className="grid gap-4 xl:grid-cols-[0.88fr_1.12fr]">
        <section className="app-panel p-4 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="app-kicker">Месяц</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">{formatMonthTitle(monthAnchor)}</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {busyDays} активных дней
            </span>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 sm:mt-6 sm:gap-2 sm:text-xs sm:tracking-[0.18em]">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {hasActivityInMonth ? (
            <div className="mt-3 grid grid-cols-7 gap-1 sm:gap-2">
              {calendarCells.map((cell, index) =>
                cell ? (
                  <button
                    key={cell.key}
                    onClick={() => setSelectedDate(cell.key)}
                    className={`relative aspect-square rounded-xl border text-xs font-medium transition sm:rounded-2xl sm:text-sm ${
                      cell.key === activeDateKey
                        ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-[0_20px_44px_-32px_rgba(37,99,235,0.65)]'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cell.label}</span>
                    {cell.requestsCount > 0 ? (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-1.5 py-0.5 text-[9px] font-semibold leading-none text-white sm:bottom-1.5 sm:text-[10px]">
                        {cell.requestsCount}
                      </span>
                    ) : null}
                  </button>
                ) : (
                  <div key={`empty-${index}`} className="aspect-square rounded-xl bg-transparent sm:rounded-2xl" />
                ),
              )}
            </div>
          ) : (
            <div className="mt-6 app-panel-soft px-5 py-10 text-sm leading-6 text-slate-500">
              В выбранном месяце еще нет событий. После первого приема техники календарь начнет сам собирать рабочую историю по дням.
            </div>
          )}
        </section>

        <section className="app-panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
            <div>
              <p className="app-kicker">Детализация дня</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                {new Date(activeDateKey).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </h2>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
              {selectedDayRequests.length} событий
            </span>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-sm text-slate-500">Загрузка календаря...</div>
          ) : selectedDayRequests.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-slate-500">
              На выбранную дату пока нет обращений.
            </div>
          ) : (
            <div className="grid gap-3 p-3 sm:p-6">
              {selectedDayRequests.map((request) => (
                <article
                  key={request.id}
                  onClick={() => onViewRequest?.(request)}
                  className={`app-panel-soft p-4 ${
                    onViewRequest
                      ? 'cursor-pointer transition duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-[0_24px_56px_-38px_rgba(37,99,235,0.45)]'
                      : ''
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">#{request.id}</span>
                        <StatusBadge status={request.status} />
                      </div>
                      <p className="mt-3 text-sm font-medium leading-6 text-slate-900">
                        {request.deviceType} {request.deviceModel}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {request.clientName} • {request.clientPhone}
                      </p>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{request.problem}</p>
                    </div>

                    <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-600">
                      <Clock3 className="h-4 w-4 text-slate-400" />
                      {request.createdAt.toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function toDateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function formatMonthTitle(value: Date) {
  return value.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  });
}
