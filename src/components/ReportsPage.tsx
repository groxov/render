import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarRange,
  CheckCircle2,
  Download,
  Layers3,
  ReceiptText,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { useReportsData } from '../hooks/useReportsData';
import { DEFAULT_FINANCE_MONTH, FINANCE_MONTH_OPTIONS, formatMonthLabel } from '../lib/finance';
import { DataStatusNotice } from './common/DataStatusNotice';
import { OperationsPulse } from './common/OperationsPulse';
import { PageIntro } from './common/PageIntro';
import { StatCard } from './common/StatCard';

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(DEFAULT_FINANCE_MONTH);
  const {
    finance,
    loading,
    filteredRequests,
    totalRequests,
    completedRequests,
    completionRate,
    statusBreakdown,
    deviceBreakdown,
    priorityBreakdown,
    incomeTransactions,
    requestsError,
    requestsUsingFallbackData,
    requestsDataSource,
  } = useReportsData(selectedMonth);

  const monthLabel = formatMonthLabel(selectedMonth);
  const financeBars = [
    {
      label: 'Доход',
      displayValue: finance.stats.totalIncome,
      value: finance.stats.totalIncome,
      toneClassName: 'from-emerald-500 to-green-400',
      textClassName: 'text-emerald-700',
    },
    {
      label: 'Расход',
      displayValue: finance.stats.totalExpenses,
      value: finance.stats.totalExpenses,
      toneClassName: 'from-rose-500 to-orange-400',
      textClassName: 'text-rose-700',
    },
    {
      label: 'Прибыль',
      displayValue: finance.stats.profit,
      value: Math.abs(finance.stats.profit),
      toneClassName: 'from-violet-500 to-blue-500',
      textClassName: finance.stats.profit >= 0 ? 'text-violet-700' : 'text-rose-700',
    },
    {
      label: 'Средний чек',
      displayValue: finance.stats.avgCheck,
      value: finance.stats.avgCheck,
      toneClassName: 'from-sky-500 to-cyan-400',
      textClassName: 'text-sky-700',
    },
  ];
  const financeBarMax = Math.max(...financeBars.map((item) => item.value), 1);

  const handleExport = () => {
    const lines = [
      ['Период', monthLabel],
      ['Доходы', finance.stats.totalIncome],
      ['Расходы', finance.stats.totalExpenses],
      ['Прибыль', finance.stats.profit],
      ['Средний чек', finance.stats.avgCheck],
      ['Всего заявок', totalRequests],
      ['Выполнено заявок', completedRequests],
      ['Процент выполнения', completionRate],
      [],
      ['Статус', 'Количество', 'Доля'],
      ...statusBreakdown.map((item) => [item.label, item.count, item.share]),
      [],
      ['Устройство', 'Количество', 'Доля'],
      ...deviceBreakdown.map((item) => [item.label, item.count, item.share]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + lines], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `report_${selectedMonth}.csv`;
    link.click();
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <PageIntro
        eyebrow="Сводная аналитика"
        title="Отчеты и аналитика"
        description="Финансовые и операционные показатели теперь собраны как одна связная отчетность: видно, какие данные пришли с сервера, а где страница временно опирается на fallback-слои."
        actions={
          <>
            <label className="app-panel-soft flex w-full min-w-0 items-center gap-3 px-4 py-3 text-sm text-slate-600 sm:w-auto sm:min-w-[210px]">
              <CalendarRange className="h-4 w-4 text-slate-500" />
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="w-full bg-transparent text-sm font-medium text-slate-700"
              >
                {FINANCE_MONTH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button onClick={handleExport} className="app-button-secondary w-full sm:w-auto">
              <Download className="h-4 w-4" />
              Экспорт CSV
            </button>
          </>
        }
      />

      {finance.usingFallbackData ? (
        <DataStatusNotice
          variant={finance.fallbackReason === 'fallback_error' ? 'warning' : 'info'}
          title={
            finance.fallbackReason === 'fallback_error'
              ? 'Финансовая часть отчета работает на резервном слое'
              : 'На этот период нет живых финансовых записей'
          }
          description={
            finance.fallbackReason === 'fallback_error'
              ? `${finance.error ?? 'API финансов недоступен.'} Для непрерывности экран использует тот же fallback-слой, что и вкладка «Финансы».`
              : 'Финансовый блок отчета и вкладка «Финансы» сейчас показывают один и тот же демонстрационный срез, чтобы цифры не расходились между разделами.'
          }
        />
      ) : null}

      {requestsUsingFallbackData || requestsError || requestsDataSource === 'empty' ? (
        <DataStatusNotice
          variant={requestsError ? 'warning' : 'info'}
          title={
            requestsError
              ? 'Операционная часть отчета обновилась не полностью'
              : requestsDataSource === 'empty'
                ? 'В заявках пока нет данных за этот срез'
                : 'Операционная часть собрана из локального слоя заявок'
          }
          description={
            requestsError
              ? `${requestsError} Поэтому распределения по статусам, устройствам и приоритетам строятся на последнем доступном локальном наборе.`
              : requestsDataSource === 'empty'
                ? 'Сервер не вернул заявок за выбранный период, поэтому аналитические блоки ниже честно покажут пустой срез без выдуманных значений.'
                : 'Серверный журнал заявок временно недоступен, но отчет продолжает работать на локальном слое, чтобы не терять аналитический контекст.'
          }
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Выручка"
          value={loading ? '...' : formatCurrency(finance.stats.totalIncome)}
          description={monthLabel}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          icon={<ArrowUpRight className="h-full w-full" />}
        />
        <StatCard
          title="Расходы"
          value={loading ? '...' : formatCurrency(finance.stats.totalExpenses)}
          description="Синхронизировано с финансами"
          iconBgColor="bg-rose-100"
          iconColor="text-rose-600"
          icon={<ArrowDownLeft className="h-full w-full" />}
        />
        <StatCard
          title="Всего заявок"
          value={loading ? '...' : totalRequests}
          description={`Выполнено ${completedRequests}`}
          iconBgColor="bg-sky-100"
          iconColor="text-sky-600"
          icon={<Layers3 className="h-full w-full" />}
        />
        <StatCard
          title="Процент выполнения"
          value={loading ? '...' : `${completionRate}%`}
          description="Доля закрытых обращений за период"
          iconBgColor="bg-violet-100"
          iconColor="text-violet-600"
          icon={<CheckCircle2 className="h-full w-full" />}
        />
      </div>

      <OperationsPulse
        requests={filteredRequests}
        rangeLabel={monthLabel}
        title="Визуальный пульс месяца"
        description="Быстрый срез по темпу обращений, статусам и доминирующим типам техники за выбранный период."
      />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="app-panel p-5 sm:p-6">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="app-kicker">Финансовая картина</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Баланс периода</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {monthLabel}
            </span>
          </div>

          <div className="mt-6 space-y-5">
            {financeBars.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-600">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.textClassName}`}>
                    {formatCurrency(item.displayValue)}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${item.toneClassName}`}
                    style={{ width: `${(item.value / financeBarMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="app-panel p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="app-kicker">Заявки</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Распределение по этапам</h2>
            </div>
            <ReceiptText className="h-5 w-5 text-slate-400" />
          </div>

          <div className="mt-6 space-y-5">
            {statusBreakdown.map((item) => (
              <div key={item.status}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-600">{item.label}</span>
                  <span className="text-slate-900">
                    {item.count} <span className="text-slate-400">({item.share}%)</span>
                  </span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${item.barClassName}`}
                    style={{ width: `${item.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="app-panel p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="app-kicker">Устройства</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Чем загружен сервис</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {deviceBreakdown.length} категорий
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {deviceBreakdown.length === 0 ? (
              <p className="text-sm leading-6 text-slate-500">За выбранный период нет заявок по устройствам.</p>
            ) : (
              deviceBreakdown.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-600">{item.label}</span>
                    <span className="text-slate-900">
                      {item.count} <span className="text-slate-400">({item.share}%)</span>
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                      style={{ width: item.width }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="app-panel p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="app-kicker">Приоритеты</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Приоритет очереди</h2>
            </div>
            <Wallet className="h-5 w-5 text-slate-400" />
          </div>

          <div className="mt-6 space-y-4">
            {priorityBreakdown.map((item) => (
              <div key={item.priority} className="app-panel-soft p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-600">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.textClassName}`}>
                    {item.count} <span className="text-slate-400">({item.share}%)</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="app-panel p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="app-kicker">Операции</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Крупные доходные записи</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {finance.transactions.length} операций
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {incomeTransactions.length === 0 ? (
              <p className="text-sm leading-6 text-slate-500">Доходных операций за период нет.</p>
            ) : (
              incomeTransactions.map((transaction) => (
                <article key={transaction.id} className="app-panel-soft p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-6 text-slate-900">{transaction.description}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        {transaction.request_id ? `Заявка ${transaction.request_id}` : 'Без привязки к заявке'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-700">
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{transaction.date}</p>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  return `${value.toLocaleString('ru-RU')} ₽`;
}
