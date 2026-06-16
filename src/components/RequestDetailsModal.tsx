import { CalendarClock, CircleDollarSign, FileText, UserRound, Wrench, X } from 'lucide-react';
import { RepairRequest } from '../types';
import { PriorityBadge, StatusBadge } from './common/StatusBadge';

interface RequestDetailsModalProps {
  request: RepairRequest;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-2">
      <p className="app-kicker">{label}</p>
      <p className="text-sm leading-6 text-slate-700">{value || 'Не указано'}</p>
    </div>
  );
}

export default function RequestDetailsModal({ request, onClose }: RequestDetailsModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-2 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="app-panel flex max-h-[calc(100dvh-1rem)] w-full max-w-5xl flex-col overflow-hidden sm:max-h-[calc(100dvh-3rem)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 bg-gradient-to-r from-[#7c3aed] via-[#5b5bd6] to-[#2563eb] px-4 py-4 text-white sm:px-6 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Карточка обращения</p>
              <h2 className="mt-3 text-xl font-semibold leading-tight sm:text-3xl">
                Заявка #{request.id}
              </h2>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/80">
                <CalendarClock className="h-4 w-4" />
                <span>
                  {request.createdAt.toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.12] text-white transition hover:bg-white/20"
              aria-label="Закрыть карточку"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          <div className="mb-6 flex flex-wrap gap-2">
            <StatusBadge status={request.status} className="px-4 py-1.5 text-sm" />
            <PriorityBadge priority={request.priority} className="px-4 py-1.5 text-sm" />
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <section className="app-panel-soft p-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="app-kicker">Клиент</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950">Контактные данные</h3>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <DetailRow label="ФИО" value={request.clientName} />
                <DetailRow label="Телефон" value={request.clientPhone} />
                <div className="sm:col-span-2">
                  <DetailRow label="Email" value={request.clientEmail} />
                </div>
              </div>
            </section>

            <section className="app-panel-soft p-5">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <p className="app-kicker">Устройство</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950">Техника и идентификация</h3>
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <DetailRow label="Тип устройства" value={request.deviceType} />
                <DetailRow label="Модель" value={request.deviceModel} />
                <div className="sm:col-span-2">
                  <DetailRow label="Серийный номер" value={request.serialNumber} />
                </div>
              </div>
            </section>
          </div>

          <section className="app-panel-soft mt-5 p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="app-kicker">Описание</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-950">Что сообщил клиент</h3>
              </div>
            </div>
            <p className="rounded-[22px] bg-white px-4 py-4 text-sm leading-7 text-slate-700 shadow-inner shadow-slate-100">
              {request.problem}
            </p>
          </section>

          <section className="app-panel-soft mt-5 p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <CircleDollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="app-kicker">Контекст работы</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-950">Статус, сроки и стоимость</h3>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <DetailRow label="Назначен мастер" value={request.assignedTo} />
              <DetailRow
                label="Создано"
                value={request.createdAt.toLocaleString('ru-RU')}
              />
              <DetailRow
                label="Обновлено"
                value={request.updatedAt ? request.updatedAt.toLocaleString('ru-RU') : undefined}
              />
              <DetailRow
                label="Завершено"
                value={request.completedAt ? request.completedAt.toLocaleString('ru-RU') : undefined}
              />

              {request.estimatedCost !== undefined ? (
                <div className="space-y-2">
                  <p className="app-kicker">Предварительная стоимость</p>
                  <p className="text-2xl font-semibold tracking-[-0.04em] text-violet-700">
                    {request.estimatedCost.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              ) : null}

              {request.actualCost !== undefined ? (
                <div className="space-y-2">
                  <p className="app-kicker">Фактическая стоимость</p>
                  <p className="text-2xl font-semibold tracking-[-0.04em] text-emerald-700">
                    {request.actualCost.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              ) : null}

              {request.notes ? (
                <div className="sm:col-span-2">
                  <DetailRow label="Примечания" value={request.notes} />
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <div className="hidden shrink-0 border-t border-slate-100 bg-slate-50/80 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Карточка открыта в режиме просмотра. Редактирование лучше держать отдельным понятным сценарием.
            </p>
            <button type="button" onClick={onClose} className="app-button-secondary w-full sm:w-auto">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
