import { Mail, MapPin, Phone, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useClientsData } from '../hooks/useClientsData';
import { DataStatusNotice } from './common/DataStatusNotice';
import { PageIntro } from './common/PageIntro';
import { StatCard } from './common/StatCard';

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { clients, loading, usingFallbackData, dataSource, error, isEmpty } = useClientsData();

  const filteredClients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return clients;
    }

    return clients.filter((client) => {
      return (
        client.name.toLowerCase().includes(query) ||
        client.phone.includes(searchQuery) ||
        client.email.toLowerCase().includes(query) ||
        client.address?.toLowerCase().includes(query)
      );
    });
  }, [clients, searchQuery]);

  const totalOrders = filteredClients.reduce((sum, client) => sum + client.totalOrders, 0);
  const returningClients = filteredClients.filter((client) => client.totalOrders > 1).length;
  const withEmail = filteredClients.filter((client) => Boolean(client.email)).length;

  return (
    <div className="animate-fadeIn space-y-6">
      <PageIntro
        eyebrow="Клиентская база"
        title="Клиенты и история обращений"
        description="Экран теперь честно показывает источник данных: сначала серверный список, затем производный слой из заявок, а если данных нет совсем, страница остается пустой и не подменяет реальность фиктивными карточками."
        actions={
          <div className="app-panel-soft flex items-center gap-3 px-4 py-3 text-sm text-slate-600">
            <Users className="h-4 w-4 text-slate-500" />
            <span>{loading ? 'Загрузка базы...' : `${filteredClients.length} клиентов в выборке`}</span>
          </div>
        }
      />

      {usingFallbackData ? (
        <DataStatusNotice
          title="Список собран из текущих заявок"
          description="Серверная база клиентов пока пуста, поэтому экран использует производный список по реальным обращениям, а не подготовленный демо-набор."
        />
      ) : null}

      {isEmpty && !loading ? (
        <DataStatusNotice
          title="Клиентская база пока пустая"
          description="На сервере еще нет карточек клиентов и в заявках нет данных, из которых можно собрать список. После первых обращений экран заполнится автоматически."
        />
      ) : null}

      {error ? (
        <DataStatusNotice
          variant="warning"
          title="API клиентов ответил с ошибкой"
          description={dataSource === 'requests'
            ? `${error} Пока экран использует производный слой из заявок.`
            : `${error} Сейчас база клиентов недоступна, поэтому страница показывает только то, что удалось собрать локально.`}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Всего клиентов"
          value={loading ? '...' : clients.length}
          description="Уникальные контакты в текущей базе"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          icon={<Users className="h-full w-full" />}
        />
        <StatCard
          title="Обращений"
          value={loading ? '...' : totalOrders.toLocaleString('ru-RU')}
          description="Суммарно по видимым клиентам"
          iconBgColor="bg-violet-100"
          iconColor="text-violet-600"
          icon={
            <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Повторные"
          value={loading ? '...' : returningClients}
          description="Клиенты с двумя и более заявками"
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          icon={
            <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          title="С email"
          value={loading ? '...' : withEmail}
          description="Контакты для уведомлений"
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          icon={<Mail className="h-full w-full" />}
        />
      </div>

      <section className="app-panel p-3 sm:p-5">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по имени, телефону, email или адресу"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="app-input pl-11"
          />
        </label>
      </section>

      {loading ? (
        <div className="app-panel px-6 py-16 text-center text-sm text-slate-500">Загрузка клиентской базы...</div>
      ) : filteredClients.length === 0 ? (
        <div className="app-panel px-6 py-16 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <p className="text-sm text-slate-500">По текущему запросу клиенты не найдены.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredClients.map((client) => (
            <article
              key={client.id}
              className="app-panel p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_26px_60px_-36px_rgba(37,99,235,0.4)] sm:p-5"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#2563eb] text-lg font-semibold text-white shadow-sm">
                  {client.name.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="break-words text-base font-semibold text-slate-950 sm:text-lg">{client.name}</h2>
                      <p className="mt-1 text-sm text-slate-500">ID клиента: {client.id}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {client.totalOrders} заявок
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{client.phone}</span>
                    </div>

                    {client.email ? (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    ) : null}

                    {client.address ? (
                      <div className="flex items-start gap-2 text-sm text-slate-600">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <span className="line-clamp-2">{client.address}</span>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Последний визит</p>
                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {client.lastVisit ? client.lastVisit.toLocaleDateString('ru-RU') : 'Еще нет заявок'}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
