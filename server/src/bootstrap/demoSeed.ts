import { dbGet, dbRun } from '../database/db';

type EmployeeSeed = {
  id: string;
  name: string;
  position: string;
  specialization: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  completedRepairs: number;
};

type RequestSeed = {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  deviceType: string;
  deviceModel: string;
  serialNumber: string;
  problem: string;
  status: 'new' | 'in_progress' | 'waiting_parts' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
  notes: string;
  createdAt: string;
  completedAt?: string | null;
};

type InventorySeed = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unitPrice: number;
  supplier: string;
  notes: string;
};

type TransactionSeed = {
  id: string;
  requestId: string | null;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
};

type SeedOptions = {
  force?: boolean;
};

const employees: EmployeeSeed[] = [
  {
    id: 'emp-001',
    name: 'Смирнов Виктор Александрович',
    position: 'Старший мастер',
    specialization: 'Ноутбуки Apple, сложная диагностика, ремонт плат',
    phone: '+7 (921) 444-0101',
    email: 'smirnov.va@kalakutsky-service.local',
    status: 'active',
    completedRepairs: 847,
  },
  {
    id: 'emp-002',
    name: 'Кузнецов Алексей Николаевич',
    position: 'Мастер',
    specialization: 'Смартфоны, планшеты, дисплейные модули',
    phone: '+7 (921) 444-0102',
    email: 'kuznetsov.an@kalakutsky-service.local',
    status: 'active',
    completedRepairs: 623,
  },
  {
    id: 'emp-003',
    name: 'Морозов Игорь Петрович',
    position: 'Мастер',
    specialization: 'ПК, ноутбуки Windows, восстановление данных',
    phone: '+7 (921) 444-0103',
    email: 'morozov.ip@kalakutsky-service.local',
    status: 'active',
    completedRepairs: 734,
  },
  {
    id: 'emp-004',
    name: 'Волков Сергей Дмитриевич',
    position: 'Мастер',
    specialization: 'Принтеры, мониторы, офисная техника',
    phone: '+7 (921) 444-0104',
    email: 'volkov.sd@kalakutsky-service.local',
    status: 'active',
    completedRepairs: 412,
  },
  {
    id: 'emp-005',
    name: 'Петров Дмитрий Игоревич',
    position: 'Администратор',
    specialization: 'Прием заявок, согласование стоимости, общение с клиентами',
    phone: '+7 (921) 444-0105',
    email: 'petrov.di@kalakutsky-service.local',
    status: 'active',
    completedRepairs: 0,
  },
  {
    id: 'emp-006',
    name: 'Орлова Марина Андреевна',
    position: 'Руководитель сервиса',
    specialization: 'Контроль качества, сроки ремонта, координация закупок',
    phone: '+7 (921) 444-0106',
    email: 'orlova.ma@kalakutsky-service.local',
    status: 'active',
    completedRepairs: 158,
  },
];

const requests: RequestSeed[] = [
  {
    id: '2026-001',
    clientId: 'client-001',
    clientName: 'Иванов Петр Сергеевич',
    clientPhone: '+7 (921) 555-0101',
    clientEmail: 'ivanov.ps@email.ru',
    deviceType: 'Ноутбук',
    deviceModel: 'Apple MacBook Pro 14 2021',
    serialNumber: 'C02XG0FDQ05N',
    problem: 'Не включается, индикатор зарядки не горит',
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'emp-001',
    estimatedCost: 25000,
    actualCost: null,
    notes: 'Проверка цепей питания и диагностика материнской платы.',
    createdAt: '2026-05-04T09:15:00.000Z',
  },
  {
    id: '2026-002',
    clientId: 'client-002',
    clientName: 'Петрова Анна Ивановна',
    clientPhone: '+7 (921) 555-0102',
    clientEmail: 'petrova.ai@gmail.com',
    deviceType: 'Смартфон',
    deviceModel: 'Samsung Galaxy S23 Ultra',
    serialNumber: 'RF8T50ABCDE',
    problem: 'Разбит экран после падения',
    status: 'waiting_parts',
    priority: 'medium',
    assignedTo: 'emp-002',
    estimatedCost: 18000,
    actualCost: null,
    notes: 'Заказан оригинальный дисплейный модуль.',
    createdAt: '2026-05-05T10:40:00.000Z',
  },
  {
    id: '2026-003',
    clientId: 'client-003',
    clientName: 'Сидоров Дмитрий Владимирович',
    clientPhone: '+7 (921) 555-0103',
    clientEmail: 'sidorov.dv@yandex.ru',
    deviceType: 'Смартфон',
    deviceModel: 'iPhone 13 Pro',
    serialNumber: 'F9GH3K4LMN2P',
    problem: 'Быстро разряжается батарея',
    status: 'completed',
    priority: 'low',
    assignedTo: 'emp-002',
    estimatedCost: 6500,
    actualCost: 6500,
    notes: 'Аккумулятор заменен, нагрузочные тесты пройдены.',
    createdAt: '2026-05-03T12:20:00.000Z',
    completedAt: '2026-05-03T15:45:00.000Z',
  },
  {
    id: '2026-004',
    clientId: 'client-004',
    clientName: 'Козлова Елена Викторовна',
    clientPhone: '+7 (921) 555-0104',
    clientEmail: 'kozlova.ev@mail.ru',
    deviceType: 'Принтер',
    deviceModel: 'HP LaserJet Pro M404dn',
    serialNumber: 'VNB8J12345',
    problem: 'Замятие бумаги и пропуски при печати',
    status: 'completed',
    priority: 'medium',
    assignedTo: 'emp-004',
    estimatedCost: 3500,
    actualCost: 3500,
    notes: 'Очищены ролики подачи бумаги, выполнена калибровка.',
    createdAt: '2026-05-03T14:10:00.000Z',
    completedAt: '2026-05-03T17:30:00.000Z',
  },
  {
    id: '2026-005',
    clientId: 'client-005',
    clientName: 'Новиков Андрей Валерьевич',
    clientPhone: '+7 (921) 555-0105',
    clientEmail: 'novikov.av@outlook.com',
    deviceType: 'Ноутбук',
    deviceModel: 'ASUS ROG Strix G15',
    serialNumber: 'L9NRAS123456',
    problem: 'Перегрев процессора и шум вентилятора',
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'emp-001',
    estimatedCost: 4500,
    actualCost: null,
    notes: 'Идет чистка системы охлаждения и замена термопасты.',
    createdAt: '2026-05-05T16:30:00.000Z',
  },
  {
    id: '2026-006',
    clientId: 'client-006',
    clientName: 'Федорова Мария Александровна',
    clientPhone: '+7 (921) 555-0106',
    clientEmail: 'fedorova.ma@gmail.com',
    deviceType: 'Компьютер',
    deviceModel: 'HP EliteDesk 800 G6',
    serialNumber: 'CZC123ABCD',
    problem: 'Не загружается Windows',
    status: 'completed',
    priority: 'high',
    assignedTo: 'emp-003',
    estimatedCost: 2500,
    actualCost: 2500,
    notes: 'Система восстановлена, данные пользователя сохранены.',
    createdAt: '2026-05-02T11:50:00.000Z',
    completedAt: '2026-05-02T13:05:00.000Z',
  },
  {
    id: '2026-007',
    clientId: 'client-007',
    clientName: 'Соколов Максим Игоревич',
    clientPhone: '+7 (921) 555-0107',
    clientEmail: 'sokolov.mi@yandex.ru',
    deviceType: 'Планшет',
    deviceModel: 'iPad Air 5',
    serialNumber: 'DMXK2V3MNOP',
    problem: 'Не работает сенсорный экран',
    status: 'waiting_parts',
    priority: 'medium',
    assignedTo: 'emp-002',
    estimatedCost: 15000,
    actualCost: null,
    notes: 'Дисплейный модуль заказан, ожидается поставка.',
    createdAt: '2026-05-04T15:35:00.000Z',
  },
  {
    id: '2026-008',
    clientId: 'client-008',
    clientName: 'Лебедева Ольга Сергеевна',
    clientPhone: '+7 (921) 555-0108',
    clientEmail: 'lebedeva.os@mail.ru',
    deviceType: 'Смартфон',
    deviceModel: 'Xiaomi 13 Pro',
    serialNumber: 'XM13P123456',
    problem: 'Попадание влаги, телефон не включается',
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'emp-004',
    estimatedCost: 8000,
    actualCost: null,
    notes: 'Чистка после влаги и проверка разъемов.',
    createdAt: '2026-05-06T13:15:00.000Z',
  },
  {
    id: '2026-009',
    clientId: 'client-009',
    clientName: 'Павлов Николай Андреевич',
    clientPhone: '+7 (921) 555-0109',
    clientEmail: 'pavlov.na@gmail.com',
    deviceType: 'Ноутбук',
    deviceModel: 'Lenovo ThinkPad X1 Carbon',
    serialNumber: 'PC12AB34CD',
    problem: 'Не работают несколько клавиш после попадания жидкости',
    status: 'new',
    priority: 'medium',
    assignedTo: 'emp-001',
    estimatedCost: 12000,
    actualCost: null,
    notes: 'Назначена диагностика клавиатуры и шлейфа.',
    createdAt: '2026-05-07T09:20:00.000Z',
  },
  {
    id: '2026-010',
    clientId: 'client-010',
    clientName: 'Васильева Татьяна Петровна',
    clientPhone: '+7 (921) 555-0110',
    clientEmail: 'vasileva.tp@yandex.ru',
    deviceType: 'Ноутбук',
    deviceModel: 'Apple MacBook Air M2',
    serialNumber: 'C02ZK1JDMD6T',
    problem: 'Вздулся аккумулятор',
    status: 'completed',
    priority: 'high',
    assignedTo: 'emp-001',
    estimatedCost: 18000,
    actualCost: 18000,
    notes: 'Батарея заменена, корпус проверен.',
    createdAt: '2026-05-02T16:05:00.000Z',
    completedAt: '2026-05-03T10:00:00.000Z',
  },
  {
    id: '2026-011',
    clientId: 'client-011',
    clientName: 'Михайлов Артем Владимирович',
    clientPhone: '+7 (921) 555-0111',
    clientEmail: 'mihailov.av@outlook.com',
    deviceType: 'Компьютер',
    deviceModel: 'Custom Gaming PC',
    serialNumber: 'CUSTOM-2023-456',
    problem: 'Нет изображения, POST не проходит',
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'emp-003',
    estimatedCost: 5000,
    actualCost: null,
    notes: 'Проверяются видеокарта и цепи питания.',
    createdAt: '2026-05-06T17:25:00.000Z',
  },
  {
    id: '2026-012',
    clientId: 'client-012',
    clientName: 'Григорьева Светлана Ивановна',
    clientPhone: '+7 (921) 555-0112',
    clientEmail: 'grigorieva.si@mail.ru',
    deviceType: 'Монитор',
    deviceModel: 'Dell UltraSharp U2720Q',
    serialNumber: 'CN-0ABCD-12345',
    problem: 'Мерцает экран',
    status: 'cancelled',
    priority: 'low',
    assignedTo: null,
    estimatedCost: null,
    actualCost: null,
    notes: 'Клиент отказался от ремонта после диагностики.',
    createdAt: '2026-05-01T10:00:00.000Z',
  },
];

const inventoryItems: InventorySeed[] = [
  {
    id: 'INV-001',
    name: 'Дисплей iPhone 13 Pro',
    category: 'Экраны',
    quantity: 15,
    minQuantity: 5,
    unitPrice: 15000,
    supplier: 'DisplayLab',
    notes: 'Оригинальные OLED-модули для срочной замены.',
  },
  {
    id: 'INV-002',
    name: 'Аккумулятор Samsung Galaxy S23',
    category: 'Батареи',
    quantity: 8,
    minQuantity: 10,
    unitPrice: 3500,
    supplier: 'Mobile Parts',
    notes: 'Партия аккумуляторов с контролем циклов зарядки.',
  },
  {
    id: 'INV-003',
    name: 'Клавиатура MacBook Pro 14',
    category: 'Клавиатуры',
    quantity: 3,
    minQuantity: 5,
    unitPrice: 12000,
    supplier: 'MacService',
    notes: 'Русская раскладка, модели 2021-2023.',
  },
  {
    id: 'INV-004',
    name: 'Материнская плата HP EliteDesk',
    category: 'Платы',
    quantity: 0,
    minQuantity: 2,
    unitPrice: 25000,
    supplier: 'HP Parts',
    notes: 'Новая ревизия под серию G6.',
  },
  {
    id: 'INV-005',
    name: 'Блок питания 65W USB-C',
    category: 'Зарядки',
    quantity: 25,
    minQuantity: 10,
    unitPrice: 2500,
    supplier: 'PowerHub',
    notes: 'Универсальные адаптеры для ноутбуков и планшетов.',
  },
  {
    id: 'INV-006',
    name: 'Термопаста Arctic MX-4',
    category: 'Расходники',
    quantity: 12,
    minQuantity: 5,
    unitPrice: 450,
    supplier: 'Cooling Store',
    notes: 'Для профилактики игровых ноутбуков и рабочих станций.',
  },
  {
    id: 'INV-007',
    name: 'SSD 512GB Samsung',
    category: 'Накопители',
    quantity: 6,
    minQuantity: 8,
    unitPrice: 5500,
    supplier: 'DiskMarket',
    notes: 'Для апгрейдов и срочной замены накопителей.',
  },
  {
    id: 'INV-008',
    name: 'Оперативная память 16GB DDR4',
    category: 'Память',
    quantity: 18,
    minQuantity: 10,
    unitPrice: 4200,
    supplier: 'RAM Pro',
    notes: 'Модули для ПК и ноутбуков сервисного обменного фонда.',
  },
];

const supplementalTransactions: TransactionSeed[] = [
  {
    id: 'fin-2026-03-01',
    requestId: null,
    type: 'income',
    description: 'Сервисный контракт на обслуживание оргтехники',
    amount: 81200,
    date: '2026-03-04T14:10:00.000Z',
  },
  {
    id: 'fin-2026-03-02',
    requestId: null,
    type: 'expense',
    description: 'Поставка печатающих головок и роликов',
    amount: 31400,
    date: '2026-03-08T12:40:00.000Z',
  },
  {
    id: 'fin-2026-04-01',
    requestId: null,
    type: 'income',
    description: 'Комплексный ремонт смартфонов и планшетов',
    amount: 73400,
    date: '2026-04-05T13:25:00.000Z',
  },
  {
    id: 'fin-2026-04-02',
    requestId: null,
    type: 'expense',
    description: 'Обновление инструмента и расходных материалов',
    amount: 24100,
    date: '2026-04-29T11:00:00.000Z',
  },
  {
    id: 'fin-2026-05-03',
    requestId: '2026-002',
    type: 'expense',
    description: 'Закупка дисплея для Samsung Galaxy S23 Ultra',
    amount: 9200,
    date: '2026-05-05T10:40:00.000Z',
  },
  {
    id: 'fin-2026-05-05',
    requestId: '2026-008',
    type: 'expense',
    description: 'Чистка после влаги и замена USB-порта',
    amount: 2800,
    date: '2026-05-06T13:15:00.000Z',
  },
  {
    id: 'fin-2026-05-08',
    requestId: null,
    type: 'expense',
    description: 'Аренда, налоги и коммунальные расходы',
    amount: 21400,
    date: '2026-05-07T09:20:00.000Z',
  },
];

export async function ensureDemoData(options: SeedOptions = {}) {
  const { force = false } = options;
  const existingRequests = await dbGet<{ count: number | string }>('SELECT COUNT(*) as count FROM repair_requests');
  const requestCount = Number(existingRequests?.count ?? 0);

  if (!force && requestCount > 0) {
    return {
      seeded: false,
      reason: 'repair_requests_not_empty',
      requestCount,
    };
  }

  const now = new Date().toISOString();
  const clients = requests.map((request) => ({
    id: request.clientId,
    name: request.clientName,
    phone: request.clientPhone,
    email: request.clientEmail,
    createdAt: request.createdAt,
  }));
  const incomeTransactions: TransactionSeed[] = requests
    .filter((request) => request.status === 'completed' && Number(request.actualCost ?? request.estimatedCost ?? 0) > 0)
    .map((request) => ({
      id: `fin-income-${request.id}`,
      requestId: request.id,
      type: 'income',
      description: `Ремонт: ${request.deviceType} ${request.deviceModel}`,
      amount: Number(request.actualCost ?? request.estimatedCost),
      date: request.completedAt ?? request.createdAt,
    }));
  const transactions = [...supplementalTransactions, ...incomeTransactions];

  await dbRun('BEGIN IMMEDIATE');

  try {
    for (const client of clients) {
      await dbRun(
        `
          INSERT INTO clients
            (id, name, phone, email, address, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            phone = excluded.phone,
            email = excluded.email,
            address = excluded.address,
            notes = excluded.notes,
            updated_at = excluded.updated_at
        `,
        [
          client.id,
          client.name,
          client.phone,
          client.email,
          null,
          'Демо-клиент для стартового наполнения системы',
          client.createdAt,
          now,
        ],
      );
    }

    for (const employee of employees) {
      await dbRun(
        `
          INSERT INTO employees
            (id, name, position, specialization, phone, email, status, completed_repairs, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            position = excluded.position,
            specialization = excluded.specialization,
            phone = excluded.phone,
            email = excluded.email,
            status = excluded.status,
            completed_repairs = excluded.completed_repairs,
            updated_at = excluded.updated_at
        `,
        [
          employee.id,
          employee.name,
          employee.position,
          employee.specialization,
          employee.phone,
          employee.email,
          employee.status,
          employee.completedRepairs,
          now,
          now,
        ],
      );
    }

    for (const request of requests) {
      await dbRun(
        `
          INSERT INTO repair_requests
            (id, client_id, client_name, client_phone, client_email, device_type, device_model, serial_number,
             problem, status, priority, assigned_to, estimated_cost, actual_cost, notes, created_at, updated_at, completed_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            client_id = excluded.client_id,
            client_name = excluded.client_name,
            client_phone = excluded.client_phone,
            client_email = excluded.client_email,
            device_type = excluded.device_type,
            device_model = excluded.device_model,
            serial_number = excluded.serial_number,
            problem = excluded.problem,
            status = excluded.status,
            priority = excluded.priority,
            assigned_to = excluded.assigned_to,
            estimated_cost = excluded.estimated_cost,
            actual_cost = excluded.actual_cost,
            notes = excluded.notes,
            updated_at = excluded.updated_at,
            completed_at = excluded.completed_at
        `,
        [
          request.id,
          request.clientId,
          request.clientName,
          request.clientPhone,
          request.clientEmail,
          request.deviceType,
          request.deviceModel,
          request.serialNumber,
          request.problem,
          request.status,
          request.priority,
          request.assignedTo,
          request.estimatedCost,
          request.actualCost,
          request.notes,
          request.createdAt,
          now,
          request.completedAt ?? null,
        ],
      );
    }

    for (const transaction of transactions) {
      await dbRun(
        `
          INSERT INTO transactions
            (id, request_id, type, description, amount, date, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            request_id = excluded.request_id,
            type = excluded.type,
            description = excluded.description,
            amount = excluded.amount,
            date = excluded.date
        `,
        [
          transaction.id,
          transaction.requestId,
          transaction.type,
          transaction.description,
          transaction.amount,
          transaction.date,
          now,
        ],
      );
    }

    for (const item of inventoryItems) {
      await dbRun(
        `
          INSERT INTO inventory
            (id, name, category, quantity, min_quantity, unit_price, supplier, notes, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            category = excluded.category,
            quantity = excluded.quantity,
            min_quantity = excluded.min_quantity,
            unit_price = excluded.unit_price,
            supplier = excluded.supplier,
            notes = excluded.notes,
            updated_at = excluded.updated_at
        `,
        [
          item.id,
          item.name,
          item.category,
          item.quantity,
          item.minQuantity,
          item.unitPrice,
          item.supplier,
          item.notes,
          now,
          now,
        ],
      );
    }

    await dbRun('COMMIT');
  } catch (error) {
    await dbRun('ROLLBACK');
    throw error;
  }

  return {
    seeded: true,
    counts: {
      clients: clients.length,
      employees: employees.length,
      repairRequests: requests.length,
      transactions: transactions.length,
      inventory: inventoryItems.length,
    },
  };
}
