import { AlertTriangle, Check, Clock3, Copy, ListTodo, UserRoundX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRequestFocus } from '../../hooks/useRequestFocus';
import { RepairRequest } from '../../types';
import { cn } from '../ui/utils';
import { PriorityBadge, StatusBadge } from './StatusBadge';

interface RequestFocusBoardProps {
  requests: RepairRequest[];
  title?: string;
  description?: string;
  eyebrow?: string;
  maxItems?: number;
  onSelectRequest?: (request: RepairRequest) => void;
  className?: string;
}

export function RequestFocusBoard({
  requests,
  title = 'Фокус дня',
  description = 'Система сама поднимает заявки, которые рискуют потеряться по срокам, приоритету и текущему этапу.',
  eyebrow = 'Умная очередь',
  maxItems = 5,
  onSelectRequest,
  className,
}: RequestFocusBoardProps) {
  const { focusQueue, summary } = useRequestFocus(requests);
  const [copyState, setCopyState] = useState<'idle' | 'done' | 'error'>('idle');

  const visibleItems = focusQueue.slice(0, maxItems);
  const copyText = useMemo(
    () =>
      [
        `Фокус-план на ${new Date().toLocaleDateString('ru-RU')}`,
        ...visibleItems.map(
          (item, index) =>
            `${index + 1}. #${item.request.id} • ${item.request.clientName} • ${item.request.deviceType} ${item.request.deviceModel}. ${item.recommendation}. ${item.deadlineLabel}.`,
        ),
      ].join('\n'),
    [visibleItems],
  );

  const handleCopy = async () => {
    if (visibleItems.length === 0) {
      return;
    }

    try {
      await navigator.clipboard.writeText(copyText);
      setCopyState('done');
    } catch (error) {
      setCopyState('error');
    } finally {
      window.setTimeout(() => setCopyState('idle'), 1800);
    }
  };

  return (
    <section className={cn('app-panel p-4 sm:p-6', className)}>
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <p className="app-kicker">{eyebrow}</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center xl:justify-end">
          <FocusPill icon={<AlertTriangle className="h-4 w-4" />} tone="rose">
            {summary.overdueCount} просрочено
          </FocusPill>
          <FocusPill icon={<Clock3 className="h-4 w-4" />} tone="amber">
            {summary.atRiskCount} под риском
          </FocusPill>
          <FocusPill icon={<UserRoundX className="h-4 w-4" />} tone="slate">
            {summary.unassignedCount} без ответственного
          </FocusPill>
          <button type="button" onClick={handleCopy} className="app-button-secondary w-full sm:w-auto">
            {copyState === 'done' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copyState === 'done'
              ? 'План скопирован'
              : copyState === 'error'
                ? 'Не удалось скопировать'
                : 'Скопировать план'}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
        <div className="space-y-3">
          {visibleItems.length === 0 ? (
            <div className="app-panel-soft px-5 py-10 text-sm leading-6 text-slate-500">
              Сейчас в активной очереди нет открытых заявок. Можно использовать окно для планирования новых приемов.
            </div>
          ) : (
            visibleItems.map((item) => (
              <article
                key={item.request.id}
                onClick={() => onSelectRequest?.(item.request)}
                className={cn(
                  'app-panel-soft p-4 transition duration-200',
                  onSelectRequest ? 'cursor-pointer hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-[0_24px_56px_-38px_rgba(37,99,235,0.45)]' : '',
                )}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold tracking-[0.18em] text-white">
                        #{item.rank}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">#{item.request.id}</span>
                      <StatusBadge status={item.request.status} />
                      <PriorityBadge priority={item.request.priority} />
                      <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', getToneClasses(item.focusState))}>
                        Фокус {item.urgencyScore}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-medium leading-6 text-slate-900">
                      {item.request.deviceType} {item.request.deviceModel}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.request.clientName} • {item.request.clientPhone}
                    </p>
                    <p className="mt-3 text-sm font-medium text-slate-700">{item.recommendation}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{item.note}</p>
                  </div>

                  <div className="w-full rounded-2xl bg-white px-4 py-3 text-sm lg:w-auto lg:shrink-0">
                    <p className="font-semibold text-slate-900">{item.deadlineLabel}</p>
                    <p className="mt-1 text-slate-500">{item.ageLabel}</p>
                    <p className="mt-1 text-slate-500">{item.request.assignedTo ? `Ответственный: ${item.request.assignedTo}` : 'Ответственный не назначен'}</p>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <aside className="app-panel-soft p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="app-kicker">Срез очереди</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">Операционная температура</h3>
            </div>
            <div className="rounded-2xl bg-white p-3 text-slate-700">
              <ListTodo className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <FocusMetric label="Открытые заявки" value={summary.openCount} hint="без завершенных и отмененных" />
            <FocusMetric label="Средний фокус" value={summary.avgUrgencyScore} hint="средний индекс очереди" />
            <FocusMetric label="Высокий приоритет" value={summary.highPriorityCount} hint="срочные работы в обороте" />
            <FocusMetric label="Стабильная зона" value={summary.onTrackCount} hint="без ближайшего риска" />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
            {summary.overdueCount > 0
              ? 'В очереди уже есть просроченные точки внимания. Имеет смысл начать день с верхних позиций списка.'
              : summary.atRiskCount > 0
                ? 'Просрочек пока нет, но часть заявок подходит к границе контроля. Лучше закрыть их раньше появления хвоста.'
                : 'Очередь выглядит управляемо. Можно спокойно переключиться на плановые работы и новые приемы.'}
          </div>
        </aside>
      </div>
    </section>
  );
}

function FocusPill({
  children,
  icon,
  tone,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  tone: 'rose' | 'amber' | 'slate';
}) {
  const toneClasses = {
    rose: 'bg-rose-50 text-rose-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-700',
  }[tone];

  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold', toneClasses)}>
      {icon}
      {children}
    </span>
  );
}

function FocusMetric({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{hint}</p>
    </div>
  );
}

function getToneClasses(focusState: 'overdue' | 'at_risk' | 'on_track') {
  if (focusState === 'overdue') {
    return 'bg-rose-50 text-rose-700';
  }

  if (focusState === 'at_risk') {
    return 'bg-amber-50 text-amber-700';
  }

  return 'bg-emerald-50 text-emerald-700';
}
