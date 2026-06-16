import { Download, RefreshCcw, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRequestFocus } from '../hooks/useRequestFocus';
import { useRequests } from '../hooks/useRequests';
import { Priority, RepairRequest, RequestStatus } from '../types';
import { DataStatusNotice } from './common/DataStatusNotice';
import { PriorityBadge, StatusBadge } from './common/StatusBadge';

interface RequestsListProps {
  onViewRequest: (request: RepairRequest) => void;
}

export default function RequestsList({ onViewRequest }: RequestsListProps) {
  const { requests, loading, error, refreshRequests, usingFallbackData, isApiEmpty } = useRequests();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [sortMode, setSortMode] = useState<'recent' | 'focus'>('focus');
  const { focusLookup, summary } = useRequestFocus(requests);

  const filteredRequests = useMemo(
    () =>
      requests.filter((request) => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const matchesSearch =
          normalizedQuery.length === 0 ||
          request.id.toLowerCase().includes(normalizedQuery) ||
          request.clientName.toLowerCase().includes(normalizedQuery) ||
          request.deviceModel.toLowerCase().includes(normalizedQuery) ||
          request.deviceType.toLowerCase().includes(normalizedQuery) ||
          request.clientPhone.includes(searchQuery);

        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      }),
    [priorityFilter, requests, searchQuery, statusFilter],
  );

  const sortedRequests = useMemo(() => {
    const list = [...filteredRequests];

    if (sortMode === 'focus') {
      return list.sort((left, right) => {
        const leftFocus = focusLookup.get(left.id)?.urgencyScore ?? -1;
        const rightFocus = focusLookup.get(right.id)?.urgencyScore ?? -1;

        if (rightFocus !== leftFocus) {
          return rightFocus - leftFocus;
        }

        return right.createdAt.getTime() - left.createdAt.getTime();
      });
    }

    return list.sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  }, [filteredRequests, focusLookup, sortMode]);

  const attentionCount = summary.overdueCount + summary.atRiskCount;

  const handleExport = () => {
    const csvContent = [
      ['Номер', 'Клиент', 'Телефон', 'Устройство', 'Модель', 'Проблема', 'Приоритет', 'Статус', 'Дата создания'].join(','),
      ...sortedRequests.map((request) =>
        [
          request.id,
          request.clientName,
          request.clientPhone,
          request.deviceType,
          request.deviceModel,
          `"${request.problem.replace(/"/g, '""')}"`,
          request.priority,
          request.status,
          request.createdAt.toLocaleDateString('ru-RU'),
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `zayavki_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-5">
      {usingFallbackData ? (
        <DataStatusNotice
          variant="warning"
          title="Журнал открыт в резервном режиме"
          description={error ?? 'Список заявок временно собран из демонстрационного набора, потому что API не ответил вовремя.'}
          action={
            <button type="button" onClick={refreshRequests} className="app-button-secondary">
              <RefreshCcw className="h-4 w-4" />
              Обновить
            </button>
          }
        />
      ) : isApiEmpty ? (
        <DataStatusNotice
          title="Журнал пока пуст"
          description="Можно спокойно настроить фильтры и сценарии работы: реальные строки появятся после первого созданного обращения."
        />
      ) : null}

      <section className="app-panel p-4 sm:p-6">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(220px,1fr)_minmax(220px,1fr)_minmax(220px,1fr)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по номеру, клиенту или устройству"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="app-input pl-11 pr-11"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Очистить поиск"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as RequestStatus | 'all')}
            className="app-select"
          >
            <option value="all">Все статусы</option>
            <option value="new">Новые</option>
            <option value="in_progress">В работе</option>
            <option value="waiting_parts">Ожидание запчастей</option>
            <option value="completed">Выполнено</option>
            <option value="cancelled">Отменено</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value as Priority | 'all')}
            className="app-select"
          >
            <option value="all">Все приоритеты</option>
            <option value="high">Высокий</option>
            <option value="medium">Средний</option>
            <option value="low">Низкий</option>
          </select>

          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as 'recent' | 'focus')}
            className="app-select"
          >
            <option value="focus">Умная очередь</option>
            <option value="recent">Сначала новые</option>
          </select>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className="app-kicker">Найдено</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              {sortedRequests.length}
            </span>
            <span className="text-slate-400">•</span>
            <span>{loading ? 'обновляем данные...' : sortMode === 'focus' ? `в фокусе ${attentionCount}` : 'список актуален'}</span>
          </div>
          <button type="button" onClick={handleExport} className="app-button-secondary w-full sm:w-auto">
            <Download className="h-4 w-4" />
            Экспорт CSV
          </button>
        </div>
      </section>

      {sortedRequests.length === 0 ? (
        <div className="app-panel px-6 py-16 text-center">
          <Search className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-5 text-lg font-semibold text-slate-900">Ничего не найдено</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Попробуйте изменить фильтры или очистить поисковый запрос, чтобы увидеть больше заявок.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4 xl:hidden">
            {sortedRequests.map((request) => {
              const focusItem = focusLookup.get(request.id);

              return (
                <article
                  key={request.id}
                  onClick={() => onViewRequest(request)}
                  className="app-panel cursor-pointer p-4 transition duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-[0_24px_56px_-36px_rgba(37,99,235,0.45)] sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-semibold text-slate-950">#{request.id}</span>
                        <StatusBadge status={request.status} />
                      </div>
                      <p className="mt-2 text-sm text-slate-500">{request.createdAt.toLocaleDateString('ru-RU')}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {focusItem ? (
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            focusItem.focusState === 'overdue'
                              ? 'bg-rose-50 text-rose-700'
                              : focusItem.focusState === 'at_risk'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          Фокус {focusItem.urgencyScore}
                        </span>
                      ) : null}
                      <PriorityBadge priority={request.priority} />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="app-kicker">Клиент</p>
                      <p className="mt-2 break-words text-base font-medium text-slate-900">{request.clientName}</p>
                      <p className="mt-1 break-words text-sm text-slate-500">{request.clientPhone}</p>
                    </div>
                    <div>
                      <p className="app-kicker">Устройство</p>
                      <p className="mt-2 break-words text-base font-medium text-slate-900">
                        {request.deviceType} {request.deviceModel}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{request.serialNumber || 'Без серийного номера'}</p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="app-kicker">Описание</p>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{request.problem}</p>
                    {focusItem ? <p className="mt-3 text-sm font-medium text-slate-700">{focusItem.recommendation}</p> : null}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-hidden xl:block">
            <div className="app-panel overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50/80">
                    <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                      <th className="px-6 py-4 font-semibold">Номер</th>
                      <th className="px-6 py-4 font-semibold">Клиент</th>
                      <th className="px-6 py-4 font-semibold">Устройство</th>
                      <th className="px-6 py-4 font-semibold">Проблема</th>
                      <th className="px-6 py-4 font-semibold">Приоритет</th>
                      <th className="px-6 py-4 font-semibold">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedRequests.map((request) => {
                      const focusItem = focusLookup.get(request.id);

                      return (
                        <tr
                          key={request.id}
                          onClick={() => onViewRequest(request)}
                          className="cursor-pointer transition hover:bg-slate-50/80"
                        >
                          <td className="px-6 py-4 align-top">
                            <div className="text-sm font-semibold text-slate-900">#{request.id}</div>
                            <div className="mt-1 text-xs text-slate-500">
                              {request.createdAt.toLocaleDateString('ru-RU')}
                            </div>
                            {focusItem ? (
                              <div
                                className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                  focusItem.focusState === 'overdue'
                                    ? 'bg-rose-50 text-rose-700'
                                    : focusItem.focusState === 'at_risk'
                                      ? 'bg-amber-50 text-amber-700'
                                      : 'bg-emerald-50 text-emerald-700'
                                }`}
                              >
                                Фокус {focusItem.urgencyScore}
                              </div>
                            ) : null}
                          </td>
                          <td className="px-6 py-4 align-top">
                            <div className="text-sm font-medium text-slate-900">{request.clientName}</div>
                            <div className="mt-1 text-xs text-slate-500">{request.clientPhone}</div>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <div className="text-sm font-medium text-slate-900">
                              {request.deviceType} {request.deviceModel}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {request.serialNumber || 'Без серийного номера'}
                            </div>
                          </td>
                          <td className="max-w-[360px] px-6 py-4 align-top">
                            <p className="line-clamp-2 text-sm leading-6 text-slate-600">{request.problem}</p>
                            {focusItem ? <p className="mt-2 text-xs leading-5 text-slate-500">{focusItem.recommendation}</p> : null}
                          </td>
                          <td className="px-6 py-4 align-top">
                            <PriorityBadge priority={request.priority} />
                          </td>
                          <td className="px-6 py-4 align-top">
                            <StatusBadge status={request.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
