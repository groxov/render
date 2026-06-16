import { Search, ShieldCheck, UserRoundCog, Users, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useEmployeesData } from '../hooks/useEmployeesData';
import { DataStatusNotice } from './common/DataStatusNotice';
import { PageIntro } from './common/PageIntro';
import { StatCard } from './common/StatCard';

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { employees, loading, usingFallbackData, error, isEmpty } = useEmployeesData();

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return employees;
    }

    return employees.filter((employee) => {
      return (
        employee.name.toLowerCase().includes(query) ||
        employee.position.toLowerCase().includes(query) ||
        employee.specialization.toLowerCase().includes(query) ||
        employee.phone.includes(searchQuery)
      );
    });
  }, [employees, searchQuery]);

  const activeEmployees = filteredEmployees.filter((employee) => employee.status === 'active');
  const masters = filteredEmployees.filter((employee) => employee.position.toLowerCase().includes('мастер'));
  const totalRepairs = filteredEmployees.reduce((sum, employee) => sum + employee.completedRepairs, 0);
  const openAssignments = filteredEmployees.reduce((sum, employee) => sum + employee.activeAssignments, 0);

  return (
    <div className="animate-fadeIn space-y-6">
      <PageIntro
        eyebrow="Команда"
        title="Сотрудники сервисного центра"
        description="Экран больше не подменяет пустую серверную базу фиктивным штатом. Если список сотрудников пуст, страница честно показывает пустое состояние, а если данные можно собрать из назначений в заявках, использует именно этот слой."
        actions={
          <div className="app-panel-soft flex items-center gap-3 px-4 py-3 text-sm text-slate-600">
            <Users className="h-4 w-4 text-slate-500" />
            <span>{loading ? 'Загрузка команды...' : `${filteredEmployees.length} сотрудников в списке`}</span>
          </div>
        }
      />

      {usingFallbackData ? (
        <DataStatusNotice
          title="Список собран из назначений в заявках"
          description="Серверный справочник сотрудников пока пуст, поэтому экран временно формирует состав команды по именам, которые уже встречаются в обращениях."
        />
      ) : null}

      {isEmpty && !loading ? (
        <DataStatusNotice
          title="Команда пока не заведена"
          description="На сервере еще нет карточек сотрудников и в заявках нет назначений, из которых можно собрать рабочий список."
        />
      ) : null}

      {error ? (
        <DataStatusNotice
          variant="warning"
          title="API сотрудников ответил с ошибкой"
          description={usingFallbackData ? `${error} Пока страница использует производный состав по текущим назначениям.` : error}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Всего сотрудников"
          value={loading ? '...' : filteredEmployees.length}
          description="Администраторы и мастера в одной команде"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          icon={<UserRoundCog className="h-full w-full" />}
        />
        <StatCard
          title="Активные"
          value={loading ? '...' : activeEmployees.length}
          description="Сейчас доступны для работы"
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          icon={<ShieldCheck className="h-full w-full" />}
        />
        <StatCard
          title="Мастера"
          value={loading ? '...' : masters.length}
          description="Специалисты по ремонту и диагностике"
          iconBgColor="bg-violet-100"
          iconColor="text-violet-600"
          icon={<Wrench className="h-full w-full" />}
        />
        <StatCard
          title="Открытая загрузка"
          value={loading ? '...' : openAssignments}
          description={`Закрыто ремонтов: ${totalRepairs.toLocaleString('ru-RU')}`}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          icon={
            <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <section className="app-panel p-3 sm:p-5">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Поиск по имени, роли, специализации или телефону"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="app-input pl-11"
          />
        </label>
      </section>

      <section className="app-panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <p className="app-kicker">Командный состав</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Роли, специализация и текущая загрузка</h2>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
            {loading ? 'Загрузка...' : `${filteredEmployees.length} человек`}
          </span>
        </div>

        {loading ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">Загрузка списка сотрудников...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-slate-500">По текущему запросу сотрудники не найдены.</div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[980px]">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Сотрудник</th>
                    <th className="px-6 py-4 font-semibold">Должность</th>
                    <th className="px-6 py-4 font-semibold">Контакты</th>
                    <th className="px-6 py-4 font-semibold">Опыт</th>
                    <th className="px-6 py-4 font-semibold">Загрузка</th>
                    <th className="w-36 px-6 py-4 font-semibold">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="transition hover:bg-slate-50/70">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 font-semibold text-blue-700">
                            {employee.name
                              .split(' ')
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join('')}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{employee.name}</p>
                            <p className="text-xs text-slate-500">ID: {employee.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900">{employee.position}</p>
                        <p className="mt-1 text-sm text-slate-500">{employee.specialization || 'Без уточненной специализации'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">{employee.phone || '—'}</p>
                        {employee.email ? <p className="mt-1 text-sm text-slate-500">{employee.email}</p> : null}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {employee.completedRepairs.toLocaleString('ru-RU')}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">выполненных ремонтов</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900">{employee.activeAssignments}</p>
                        <p className="mt-1 text-xs text-slate-500">активных заявок</p>
                      </td>
                      <td className="w-36 px-6 py-4">
                        <span
                          className={`inline-flex min-w-24 items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                            employee.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 ring-emerald-200'
                              : 'bg-slate-100 text-slate-700 ring-slate-200'
                          }`}
                        >
                          {employee.status === 'active' ? 'В работе' : 'Неактивен'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-3 sm:p-6 lg:hidden">
              {filteredEmployees.map((employee) => (
                <article key={employee.id} className="app-panel-soft p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 font-semibold text-blue-700">
                      {employee.name
                        .split(' ')
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join('')}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-slate-950">{employee.name}</h3>
                          <p className="mt-1 text-sm text-slate-500">{employee.position}</p>
                        </div>
                        <span
                          className={`inline-flex min-w-24 items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                            employee.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 ring-emerald-200'
                              : 'bg-slate-100 text-slate-700 ring-slate-200'
                          }`}
                        >
                          {employee.status === 'active' ? 'В работе' : 'Неактивен'}
                        </span>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        {employee.specialization || 'Без уточненной специализации'}
                      </p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Контакт</p>
                          <p className="mt-1 text-sm font-medium text-slate-700">{employee.phone || '—'}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Загрузка</p>
                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {employee.activeAssignments} активных заявок
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-slate-200 pt-4">
                        <p className="text-sm font-medium text-slate-700">
                          Выполнено ремонтов: {employee.completedRepairs.toLocaleString('ru-RU')}
                        </p>
                      </div>
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
