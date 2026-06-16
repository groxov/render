import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarRange,
  CreditCard,
  Download,
  ReceiptText,
  TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { useFinanceData } from '../hooks/useFinanceData';
import { DEFAULT_FINANCE_MONTH, FINANCE_MONTH_OPTIONS, formatMonthLabel } from '../lib/finance';
import { DataStatusNotice } from './common/DataStatusNotice';
import { PageIntro } from './common/PageIntro';
import { StatCard } from './common/StatCard';

export default function FinancePage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(DEFAULT_FINANCE_MONTH);
  const { transactions, stats, loading, usingFallbackData, fallbackReason, error } = useFinanceData(selectedMonth);

  const monthLabel = formatMonthLabel(selectedMonth);
  const profitMargin = stats.totalIncome > 0 ? ((stats.profit / stats.totalIncome) * 100).toFixed(1) : '0';
  const chartData = [
    {
      label: 'Доход',
      value: stats.totalIncome,
      accent: 'from-emerald-500 to-green-400',
      text: 'text-emerald-700',
    },
    {
      label: 'Расход',
      value: stats.totalExpenses,
      accent: 'from-rose-500 to-orange-400',
      text: 'text-rose-700',
    },
    {
      label: 'Прибыль',
      value: Math.max(Math.abs(stats.profit), 0),
      accent: 'from-violet-500 to-blue-500',
      text: stats.profit >= 0 ? 'text-violet-700' : 'text-rose-700',
    },
  ];
  const chartMax = Math.max(...chartData.map((item) => item.value), 1);

  const handleExport = () => {
    const csvContent = [
      ['Дата', 'Описание', 'Тип', 'Сумма', 'Заявка'].join(','),
      ...transactions.map((transaction) =>
        [
          transaction.date,
          `"${transaction.description.replace(/"/g, '""')}"`,
          transaction.type === 'income' ? 'Доход' : 'Расход',
          transaction.amount,
          transaction.request_id || '',
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${selectedMonth}.csv`;
    link.click();
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <PageIntro
        eyebrow="Финансовый контур"
        title="Финансы сервисного центра"
        description="Помесячная сводка по выручке, расходам и операциям. Экран теперь аккуратно различает живые серверные данные и fallback-слой, чтобы не смешивать демонстрацию и реальную картину."
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

      {usingFallbackData ? (
        <DataStatusNotice
          variant={fallbackReason === 'fallback_error' ? 'warning' : 'info'}
          title={
            fallbackReason === 'fallback_error'
              ? 'Финансовый API сейчас недоступен'
              : 'На этот период включен демонстрационный финансовый слой'
          }
          description={
            fallbackReason === 'fallback_error'
              ? `${error ?? 'Не удалось получить операции с сервера.'} Пока экран использует подготовленную сводку, чтобы аналитика не исчезала полностью.`
              : 'На выбранный месяц API не вернул ни операций, ни значимых агрегатов, поэтому интерфейс временно показывает подготовленный fallback с тем же форматом карточек и таблиц.'
          }
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Доходы"
          value={loading ? '...' : `${stats.totalIncome.toLocaleString('ru-RU')} ₽`}
          description={monthLabel}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          icon={<ArrowUpRight className="h-full w-full" />}
        />
        <StatCard
          title="Расходы"
          value={loading ? '...' : `${stats.totalExpenses.toLocaleString('ru-RU')} ₽`}
          description="Закупки, фонд и сопровождение"
          iconBgColor="bg-rose-100"
          iconColor="text-rose-600"
          icon={<ArrowDownLeft className="h-full w-full" />}
        />
        <StatCard
          title="Прибыль"
          value={loading ? '...' : `${stats.profit.toLocaleString('ru-RU')} ₽`}
          description={`Маржа ${profitMargin}%`}
          icon={<TrendingUp className="h-full w-full" />}
        />
        <StatCard
          title="Средний чек"
          value={loading ? '...' : `${stats.avgCheck.toLocaleString('ru-RU')} ₽`}
          description="Средняя стоимость закрытой заявки"
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          icon={<CreditCard className="h-full w-full" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="app-panel p-5 sm:p-6">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="app-kicker">Динамика месяца</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Баланс по ключевым категориям</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {monthLabel}
            </span>
          </div>

          <div className="mt-6 space-y-5">
            {chartData.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-600">{item.label}</span>
                  <span className={`text-sm font-semibold ${item.text}`}>
                    {item.value.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${item.accent}`}
                    style={{ width: `${(item.value / chartMax) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="app-panel p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="app-kicker">Сводка</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Что происходит по деньгам</h2>
            </div>
            <ReceiptText className="h-5 w-5 text-slate-400" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="app-panel-soft p-4">
              <p className="text-sm text-slate-500">Чистый результат</p>
              <p className={`mt-2 text-2xl font-semibold ${stats.profit >= 0 ? 'text-slate-950' : 'text-rose-700'}`}>
                {loading ? '...' : `${stats.profit.toLocaleString('ru-RU')} ₽`}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {stats.profit >= 0 ? 'Период закрывается в плюсе.' : 'Расходы временно выше доходов.'}
              </p>
            </div>
            <div className="app-panel-soft p-4">
              <p className="text-sm text-slate-500">Объем операций</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{loading ? '...' : transactions.length}</p>
              <p className="mt-2 text-sm text-slate-500">Последние движения за выбранный месяц.</p>
            </div>
          </div>
        </section>
      </div>

      <section className="app-panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <p className="app-kicker">Лента операций</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Последние транзакции</h2>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
            {loading ? 'Загрузка...' : `${transactions.length} записей`}
          </span>
        </div>

        {loading ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">Загрузка финансовых операций...</div>
        ) : transactions.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">За выбранный период транзакций нет.</div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[780px]">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Дата</th>
                    <th className="px-6 py-4 font-semibold">Описание</th>
                    <th className="px-6 py-4 font-semibold">Заявка</th>
                    <th className="px-6 py-4 font-semibold">Тип</th>
                    <th className="px-6 py-4 text-right font-semibold">Сумма</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="transition hover:bg-slate-50/70">
                      <td className="px-6 py-4 text-sm text-slate-600">{transaction.date}</td>
                      <td className="px-6 py-4">
                        <p className="max-w-[320px] text-sm font-medium text-slate-900">{transaction.description}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {transaction.request_id ? `№${transaction.request_id}` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            transaction.type === 'income'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {transaction.type === 'income' ? 'Доход' : 'Расход'}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 text-right text-sm font-semibold ${
                          transaction.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '−'}
                        {transaction.amount.toLocaleString('ru-RU')} ₽
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 sm:p-6 lg:hidden">
              {transactions.map((transaction) => (
                <article key={transaction.id} className="app-panel-soft p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            transaction.type === 'income'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {transaction.type === 'income' ? 'Доход' : 'Расход'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {transaction.request_id ? `№${transaction.request_id}` : 'Без заявки'}
                        </span>
                      </div>
                      <p className="mt-3 text-sm font-medium leading-6 text-slate-900">{transaction.description}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-base font-semibold ${
                          transaction.type === 'income' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {transaction.type === 'income' ? '+' : '−'}
                        {transaction.amount.toLocaleString('ru-RU')} ₽
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{transaction.date}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
