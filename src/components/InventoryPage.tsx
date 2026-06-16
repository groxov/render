import { AlertTriangle, Boxes, PackageSearch, Search, Tags } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageIntro } from './common/PageIntro';
import { StatCard } from './common/StatCard';

type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  price: number;
  supplier: string;
}

const INVENTORY_ITEMS: InventoryItem[] = [
  { id: 'INV-001', name: 'Дисплей iPhone 13 Pro', category: 'Экраны', quantity: 15, minQuantity: 5, price: 15000, supplier: 'DisplayLab' },
  { id: 'INV-002', name: 'Аккумулятор Samsung Galaxy S23', category: 'Батареи', quantity: 8, minQuantity: 10, price: 3500, supplier: 'Mobile Parts' },
  { id: 'INV-003', name: 'Клавиатура MacBook Pro 14"', category: 'Клавиатуры', quantity: 3, minQuantity: 5, price: 12000, supplier: 'MacService' },
  { id: 'INV-004', name: 'Материнская плата HP EliteDesk', category: 'Платы', quantity: 0, minQuantity: 2, price: 25000, supplier: 'HP Parts' },
  { id: 'INV-005', name: 'Блок питания 65W USB-C', category: 'Зарядки', quantity: 25, minQuantity: 10, price: 2500, supplier: 'PowerHub' },
  { id: 'INV-006', name: 'Термопаста Arctic MX-4', category: 'Расходники', quantity: 12, minQuantity: 5, price: 450, supplier: 'Cooling Store' },
  { id: 'INV-007', name: 'SSD 512GB Samsung', category: 'Накопители', quantity: 6, minQuantity: 8, price: 5500, supplier: 'DiskMarket' },
  { id: 'INV-008', name: 'Оперативная память 16GB DDR4', category: 'Память', quantity: 18, minQuantity: 10, price: 4200, supplier: 'RAM Pro' },
];

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InventoryStatus>('all');

  const inventory = useMemo(
    () =>
      INVENTORY_ITEMS.map((item) => ({
        ...item,
        status: getInventoryStatus(item.quantity, item.minQuantity),
      })),
    [],
  );

  const filteredInventory = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return inventory.filter((item) => {
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.supplier.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [inventory, searchQuery, statusFilter]);

  const totalValue = filteredInventory.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const lowStockItems = filteredInventory.filter((item) => item.status !== 'in_stock');
  const categoriesCount = new Set(filteredInventory.map((item) => item.category)).size;

  return (
    <div className="animate-fadeIn space-y-6">
      <PageIntro
        eyebrow="Складской контур"
        title="Инвентарь и комплектующие"
        description="Экран собран в том же стиле, что и остальная админка: спокойная аналитика сверху, фильтры по центру и понятный список позиций снизу. Фокус на остатках, дефиците и стоимости склада."
        actions={
          <div className="app-panel-soft flex items-center gap-3 px-4 py-3 text-sm text-slate-600">
            <Boxes className="h-4 w-4 text-slate-500" />
            <span>{filteredInventory.length} позиций в выборке</span>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Позиций"
          value={filteredInventory.length}
          description="SKU в текущем срезе"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          icon={<Boxes className="h-full w-full" />}
        />
        <StatCard
          title="Стоимость склада"
          value={`${totalValue.toLocaleString('ru-RU')} ₽`}
          description="Оценка по доступным остаткам"
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          icon={
            <svg className="h-full w-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Под заказ"
          value={lowStockItems.length}
          description="Заканчиваются или уже отсутствуют"
          iconBgColor="bg-rose-100"
          iconColor="text-rose-600"
          icon={<AlertTriangle className="h-full w-full" />}
        />
        <StatCard
          title="Категорий"
          value={categoriesCount}
          description="Группы комплектующих в выборке"
          iconBgColor="bg-violet-100"
          iconColor="text-violet-600"
          icon={<Tags className="h-full w-full" />}
        />
      </div>

      <section className="app-panel p-3 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по названию, категории или поставщику"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="app-input pl-11"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | InventoryStatus)}
            className="app-select"
          >
            <option value="all">Все статусы</option>
            <option value="in_stock">В наличии</option>
            <option value="low_stock">Мало на складе</option>
            <option value="out_of_stock">Нет в наличии</option>
          </select>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="app-panel p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="app-kicker">Контроль остатков</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Что требует внимания</h2>
            </div>
            <PackageSearch className="h-5 w-5 text-slate-400" />
          </div>

          <div className="mt-6 space-y-3">
            {lowStockItems.length === 0 ? (
              <p className="text-sm leading-6 text-slate-500">Все позиции в пределах минимального запаса.</p>
            ) : (
              lowStockItems.map((item) => (
                <article key={item.id} className="app-panel-soft p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.category}</p>
                    </div>
                    <span className={getInventoryStatusBadge(item.status).className}>
                      {getInventoryStatusBadge(item.status).label}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                    <span>Остаток: {item.quantity}</span>
                    <span>Минимум: {item.minQuantity}</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="app-panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
            <div>
              <p className="app-kicker">Складская ведомость</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Текущие позиции</h2>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
              {filteredInventory.length} записей
            </span>
          </div>

          {filteredInventory.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-slate-500">По текущим фильтрам позиции не найдены.</div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[860px]">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Артикул</th>
                      <th className="px-6 py-4 font-semibold">Позиция</th>
                      <th className="px-6 py-4 font-semibold">Категория</th>
                      <th className="px-6 py-4 font-semibold">Поставщик</th>
                      <th className="px-6 py-4 font-semibold">Остаток</th>
                      <th className="px-6 py-4 font-semibold">Цена</th>
                      <th className="px-6 py-4 font-semibold">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInventory.map((item) => (
                      <tr key={item.id} className="transition hover:bg-slate-50/70">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.id}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-900">{item.name}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.supplier}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {item.quantity} <span className="text-slate-400">/ мин. {item.minQuantity}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {item.price.toLocaleString('ru-RU')} ₽
                        </td>
                        <td className="px-6 py-4">
                          <span className={getInventoryStatusBadge(item.status).className}>
                            {getInventoryStatusBadge(item.status).label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 p-3 sm:p-6 lg:hidden">
                {filteredInventory.map((item) => (
                  <article key={item.id} className="app-panel-soft p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.id} • {item.category}
                        </p>
                      </div>
                      <span className={getInventoryStatusBadge(item.status).className}>
                        {getInventoryStatusBadge(item.status).label}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Остаток</p>
                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {item.quantity} / мин. {item.minQuantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Цена</p>
                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {item.price.toLocaleString('ru-RU')} ₽
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Поставщик</p>
                      <p className="mt-1 text-sm font-medium text-slate-700">{item.supplier}</p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function getInventoryStatus(quantity: number, minQuantity: number): InventoryStatus {
  if (quantity <= 0) {
    return 'out_of_stock';
  }

  if (quantity <= minQuantity) {
    return 'low_stock';
  }

  return 'in_stock';
}

function getInventoryStatusBadge(status: InventoryStatus) {
  if (status === 'in_stock') {
    return {
      label: 'В наличии',
      className: 'rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700',
    };
  }

  if (status === 'low_stock') {
    return {
      label: 'Мало на складе',
      className: 'rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700',
    };
  }

  return {
    label: 'Нет в наличии',
    className: 'rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700',
  };
}
