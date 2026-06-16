import { Activity, CircleDashed, Gauge, Layers3, Sparkles, TrendingUp } from 'lucide-react';
import { ReactNode, useMemo } from 'react';
import { STATUS_GRADIENT_COLORS, STATUS_LABELS } from '../../constants';
import { RepairRequest, RequestStatus } from '../../types';
import { cn } from '../ui/utils';

interface OperationsPulseProps {
  requests: RepairRequest[];
  title?: string;
  description?: string;
  eyebrow?: string;
  rangeLabel?: string;
  className?: string;
}

const DEVICE_TONES = [
  'from-blue-500/16 to-cyan-400/16 text-blue-700',
  'from-violet-500/16 to-indigo-400/16 text-violet-700',
  'from-emerald-500/16 to-lime-400/16 text-emerald-700',
  'from-amber-500/16 to-orange-400/16 text-amber-700',
  'from-rose-500/16 to-pink-400/16 text-rose-700',
] as const;

export function OperationsPulse({
  requests,
  title = 'Операционный ритм',
  description = 'Живая визуализация потока обращений, текущего давления очереди и распределения по устройствам.',
  eyebrow = 'Пульс сервиса',
  rangeLabel = 'Последние 14 дней',
  className,
}: OperationsPulseProps) {
  const analytics = useMemo(() => buildOperationsAnalytics(requests), [requests]);

  return (
    <section className={cn('app-panel relative overflow-hidden p-4 sm:p-6', className)}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_42%)]" />
        <div className="absolute inset-y-0 left-0 w-44 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.09),transparent_60%)]" />
      </div>

      <div className="relative min-w-0">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="app-kicker">{eyebrow}</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
              <Sparkles className="h-4 w-4" />
              {rangeLabel}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
              <CircleDashed className="h-4 w-4" />
              {analytics.totalRequests} обращений
            </span>
          </div>
        </div>

        <div className="mt-5 grid min-w-0 gap-4 xl:mt-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
          <section className="min-w-0 rounded-[18px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.98))] p-4 shadow-[0_18px_48px_-38px_rgba(15,23,42,0.45)] sm:rounded-[22px] sm:p-5">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Поток по дням</p>
                  <div className="mt-3 flex flex-wrap items-end gap-3">
                    <span className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                      {analytics.currentWeekTotal}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                        analytics.trendToneClassName,
                      )}
                    >
                      {analytics.trendLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    Пиковый день: {analytics.peakDay.label} • {analytics.peakDay.count} заявок
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
                  <CompactMetric label="Активных дней" value={analytics.busyDays.toString()} hint="с обращениями в срезе" />
                  <CompactMetric label="Средний день" value={analytics.averagePerDay.toString()} hint="заявок в день" />
                  <CompactMetric label="Пик в день" value={analytics.peakDay.count.toString()} hint="максимум за день" />
                </div>
              </div>

              <div className="min-w-0 rounded-[16px] border border-slate-200/80 bg-slate-50/90 p-3 sm:rounded-[20px] sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                      14-дневный поток
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                      {analytics.totalRequests} всего
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500">
                    Последняя точка: {analytics.lastDay.label} • {analytics.lastDay.count}
                  </p>
                </div>

                <div className="mt-4 min-w-0 overflow-hidden rounded-[16px] border border-slate-200/70 bg-white/90 px-2 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:mt-5 sm:rounded-[20px] sm:px-4 sm:py-4">
                  <div className="grid min-w-0 gap-4 lg:grid-cols-[40px_minmax(0,1fr)]">
                    <div className="hidden h-64 flex-col justify-between pt-2 text-right text-[11px] font-medium text-slate-400 lg:flex">
                      {analytics.chartTicks.map((tick) => (
                        <span key={tick}>{tick}</span>
                      ))}
                    </div>

                    <div className="min-w-0">
                      <div className="relative h-44 rounded-[14px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(248,250,252,0.74),rgba(255,255,255,0.94))] px-1.5 pb-3 pt-2 sm:h-64 sm:rounded-[20px] sm:px-4 sm:pb-4 sm:pt-3">
                        <div className="absolute inset-x-2 inset-y-3 sm:inset-x-4">
                          <div className="grid h-full grid-rows-4">
                            {analytics.chartTicks.slice(0, -1).map((tick) => (
                              <div
                                key={tick}
                                className="border-b border-dashed border-slate-200/80"
                              />
                            ))}
                          </div>
                        </div>

                        <div className="relative flex h-full min-w-0 items-end gap-0.5 sm:gap-2">
                          {analytics.dailySeries.map((day, index) => {
                            const isLatest = day.key === analytics.lastDay.key;
                            const isPeak = day.count === analytics.peakDay.count && day.count > 0;

                            return (
                              <div key={day.key} className="flex min-w-0 flex-1 flex-col justify-end">
                                <div className="flex h-7 items-end justify-center sm:h-9">
                                  {day.count > 0 ? (
                                    <span
                                      className={cn(
                                        'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold shadow-sm sm:px-2 sm:text-[11px]',
                                        isPeak
                                          ? 'bg-violet-100 text-violet-700'
                                          : 'bg-white text-slate-600',
                                      )}
                                    >
                                      {day.count}
                                    </span>
                                  ) : null}
                                </div>

                                <div
                                  className={cn(
                                    'relative flex flex-1 items-end justify-center rounded-xl border border-slate-200/80 bg-white/92 px-0.5 pb-1.5 pt-2 shadow-[0_14px_28px_-28px_rgba(15,23,42,0.75)] transition duration-300 sm:rounded-[18px] sm:px-1.5 sm:pb-2 sm:pt-3',
                                    isLatest ? 'border-blue-100 bg-blue-50/35' : '',
                                  )}
                                >
                                  {isPeak ? (
                                    <div className="absolute inset-x-3 top-2 h-6 rounded-full bg-violet-100/70 blur-md" />
                                  ) : null}

                                  <div className="relative flex h-full w-full items-end justify-center">
                                    <div
                                      className={cn(
                                        'w-full max-w-[18px] rounded-[10px] bg-gradient-to-t shadow-[0_14px_28px_-20px_rgba(79,70,229,0.65)] sm:max-w-[34px] sm:rounded-[14px]',
                                        day.count > 0
                                          ? 'from-[#2563eb] via-[#4f46e5] to-[#7c3aed]'
                                          : 'from-slate-200 to-slate-100 shadow-none',
                                      )}
                                      style={{
                                        height: `${Math.max(8, Math.round((day.count / analytics.chartScaleMax) * 132))}px`,
                                        opacity: day.count > 0 ? 0.96 : 1,
                                      }}
                                    />
                                  </div>
                                </div>

                                <div className="mt-2 text-center sm:mt-3">
                                  <p className="text-[10px] font-medium text-slate-500 sm:text-[11px]">{day.shortLabel}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <ChartInsight
                          icon={<TrendingUp className="h-4 w-4" />}
                          label="Темп недели"
                          value={analytics.trendLabel}
                        />
                        <ChartInsight
                          icon={<CircleDashed className="h-4 w-4" />}
                          label="Тихих дней"
                          value={`${analytics.quietDays} из ${analytics.dailySeries.length}`}
                        />
                        <ChartInsight
                          icon={<Sparkles className="h-4 w-4" />}
                          label="Последний день"
                          value={`${analytics.lastDay.label} • ${analytics.lastDay.count}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="grid min-w-0 gap-4">
            <div className="min-w-0 rounded-[18px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.98))] p-4 shadow-[0_18px_48px_-38px_rgba(15,23,42,0.45)] sm:rounded-[22px] sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">Статусный баланс</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">Состояние очереди</h3>
                </div>
                <Activity className="h-5 w-5 text-slate-400" />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <VisualMetric
                  icon={<Gauge className="h-4 w-4" />}
                  label="Открытое давление"
                  value={`${analytics.openRate}%`}
                  hint={`${analytics.openRequests} из ${analytics.totalRequests} еще в работе`}
                />
                <VisualMetric
                  icon={<Layers3 className="h-4 w-4" />}
                  label="Доля завершения"
                  value={`${analytics.completionRate}%`}
                  hint="закрытые заявки в текущем срезе"
                />
              </div>

              <div className="mt-6 overflow-hidden rounded-full bg-slate-100">
                <div className="flex h-3 w-full">
                  {analytics.statusSegments.map((segment) => (
                    <div
                      key={segment.status}
                      className={`h-3 bg-gradient-to-r ${segment.gradientClassName}`}
                      style={{ width: `${segment.width}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {analytics.statusSegments.map((segment) => (
                  <div key={segment.status}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-slate-600">{STATUS_LABELS[segment.status]}</span>
                      <span className="text-slate-900">
                        {segment.count} <span className="text-slate-400">({segment.width}%)</span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${segment.gradientClassName}`}
                        style={{ width: `${segment.width}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-0 rounded-[18px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.98))] p-4 shadow-[0_18px_48px_-38px_rgba(15,23,42,0.45)] sm:rounded-[22px] sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">Устройства</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">Чем живет поток</h3>
                </div>
                <Sparkles className="h-5 w-5 text-slate-400" />
              </div>

              <div className="mt-5 space-y-3">
                {analytics.deviceMix.length === 0 ? (
                  <p className="text-sm leading-6 text-slate-500">Пока нет данных по устройствам в выбранном срезе.</p>
                ) : (
                  analytics.deviceMix.map((device, index) => (
                    <div key={device.label} className="rounded-[16px] border border-slate-200/70 bg-white/90 px-4 py-4 sm:rounded-[20px]">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div
                          className={cn(
                            'rounded-full bg-gradient-to-r px-3 py-1.5 text-sm font-semibold',
                            DEVICE_TONES[index % DEVICE_TONES.length],
                          )}
                        >
                          {device.label}
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{device.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-[#7c3aed] via-[#4f46e5] to-[#2563eb]"
                          style={{ width: `${device.width}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <CompactMetric label="Ведущий тип" value={analytics.dominantDevice.label} hint={`${analytics.dominantDevice.count} в потоке`} />
                <CompactMetric label="Активных типов" value={analytics.deviceMix.length.toString()} hint="категорий техники" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function VisualMetric({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[16px] border border-slate-200 bg-white/92 px-4 py-4 shadow-[0_14px_34px_-32px_rgba(15,23,42,0.65)] sm:rounded-[20px]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <div className="rounded-xl bg-slate-100 p-2 text-slate-600">{icon}</div>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950">{value}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{hint}</p>
    </div>
  );
}

function CompactMetric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[16px] border border-slate-200/80 bg-white/88 px-4 py-4 shadow-[0_16px_34px_-34px_rgba(15,23,42,0.8)] sm:rounded-[18px]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 line-clamp-1 text-xl font-semibold tracking-[-0.04em] text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{hint}</p>
    </div>
  );
}

function ChartInsight({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-slate-200/80 bg-white/88 px-3 py-3 shadow-[0_14px_28px_-30px_rgba(15,23,42,0.8)]">
      <div className="flex items-center gap-2 text-slate-500">
        <span className="rounded-xl bg-slate-100 p-2">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      </div>
      <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function buildOperationsAnalytics(requests: RepairRequest[]) {
  const anchor = requests.length > 0
    ? new Date(Math.max(...requests.map((request) => request.createdAt.getTime())))
    : new Date();

  const dailySeries = buildDailySeries(requests, anchor, 14);
  const maxDailyCount = Math.max(...dailySeries.map((day) => day.count), 1);
  const chartScaleMax = resolveChartScaleMax(maxDailyCount);
  const chartTicks = buildChartTicks(chartScaleMax);

  const currentWeekTotal = dailySeries.slice(-7).reduce((sum, day) => sum + day.count, 0);
  const previousWeekTotal = dailySeries.slice(0, 7).reduce((sum, day) => sum + day.count, 0);
  const trendDelta = currentWeekTotal - previousWeekTotal;
  const trendPercent =
    previousWeekTotal > 0 ? Math.round((Math.abs(trendDelta) / previousWeekTotal) * 100) : currentWeekTotal > 0 ? 100 : 0;
  const trendLabel =
    trendDelta > 0
      ? `+${trendPercent}% к прошлой неделе`
      : trendDelta < 0
        ? `−${trendPercent}% к прошлой неделе`
        : 'ровный темп';
  const trendToneClassName =
    trendDelta > 0
      ? 'bg-blue-50 text-blue-700'
      : trendDelta < 0
        ? 'bg-emerald-50 text-emerald-700'
        : 'bg-slate-100 text-slate-700';

  const totalRequests = requests.length;
  const openRequests = requests.filter((request) => request.status !== 'completed' && request.status !== 'cancelled').length;
  const completionRate =
    totalRequests > 0 ? Math.round((requests.filter((request) => request.status === 'completed').length / totalRequests) * 100) : 0;
  const openRate = totalRequests > 0 ? Math.round((openRequests / totalRequests) * 100) : 0;
  const busyDays = dailySeries.filter((day) => day.count > 0).length;
  const quietDays = dailySeries.length - busyDays;
  const averagePerDay = totalRequests > 0 ? Math.max(1, Math.round(totalRequests / dailySeries.length)) : 0;

  const statusSegments = (Object.keys(STATUS_LABELS) as RequestStatus[]).map((status) => {
    const count = requests.filter((request) => request.status === status).length;
    const width = totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0;

    return {
      status,
      count,
      width,
      gradientClassName: STATUS_GRADIENT_COLORS[status],
    };
  });

  const deviceCounts = new Map<string, number>();
  requests.forEach((request) => {
    const key = request.deviceType.trim() || 'Не указано';
    deviceCounts.set(key, (deviceCounts.get(key) ?? 0) + 1);
  });

  const maxDeviceCount = Math.max(...deviceCounts.values(), 1);
  const deviceMix = Array.from(deviceCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([label, count]) => ({
      label,
      count,
      width: Math.max(18, Math.round((count / maxDeviceCount) * 100)),
    }));

  const peakDay =
    [...dailySeries].sort((left, right) => right.count - left.count)[0] ?? {
      key: '',
      count: 0,
      label: '—',
      shortLabel: '',
    };

  const lastDay = dailySeries[dailySeries.length - 1] ?? {
    key: '',
    count: 0,
    label: '—',
    shortLabel: '',
  };

  return {
    totalRequests,
    openRequests,
    openRate,
    completionRate,
    busyDays,
    quietDays,
    averagePerDay,
    dailySeries,
    maxDailyCount,
    chartScaleMax,
    chartTicks,
    currentWeekTotal,
    trendLabel,
    trendToneClassName,
    statusSegments,
    deviceMix,
    dominantDevice: deviceMix[0] ?? { label: '—', count: 0, width: 0 },
    peakDay,
    lastDay,
  };
}

function buildDailySeries(requests: RepairRequest[], anchor: Date, days: number) {
  const endOfAnchorDay = new Date(anchor);
  endOfAnchorDay.setHours(0, 0, 0, 0);
  const start = new Date(endOfAnchorDay);
  start.setDate(start.getDate() - (days - 1));

  const counts = new Map<string, number>();
  requests.forEach((request) => {
    const key = toDateKey(request.createdAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return Array.from({ length: days }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    const key = toDateKey(current);

    return {
      key,
      count: counts.get(key) ?? 0,
      label: current.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      shortLabel: current.toLocaleDateString('ru-RU', { day: '2-digit' }),
    };
  });
}

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function resolveChartScaleMax(maxDailyCount: number) {
  if (maxDailyCount <= 3) {
    return 3;
  }

  if (maxDailyCount <= 6) {
    return 6;
  }

  return Math.ceil(maxDailyCount / 5) * 5;
}

function buildChartTicks(chartScaleMax: number) {
  return [chartScaleMax, Math.round(chartScaleMax * 0.66), Math.round(chartScaleMax * 0.33), 0];
}
