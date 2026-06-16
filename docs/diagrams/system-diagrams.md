# Диаграммы системы

Ниже собраны базовые диаграммы по текущей реализации проекта `neozon-main`.
Формат: `Mermaid`.

## 1. Диаграмма деятельности

Сценарий: создание новой заявки на ремонт через административную форму.

```mermaid
flowchart TD
    A[Администратор открывает экран\nНовая заявка] --> B[Заполняет данные клиента,\nустройства и проблемы]
    B --> C{Frontend-валидация\nуспешна?}
    C -- Нет --> D[Показать ошибки формы]
    D --> B
    C -- Да --> E[requestsApi.create отправляет\nPOST /api/requests]
    E --> F[Express route + Zod validation]
    F --> G{Payload валиден?}
    G -- Нет --> H[Вернуть 4xx и текст ошибки]
    H --> I[Frontend показывает ошибку]
    I --> B
    G -- Да --> J[requestsController.createRequest]
    J --> K[Проверить назначенного сотрудника,\nесли он указан]
    K --> L[Найти клиента по телефону\nили создать нового]
    L --> M[Создать запись repair_requests]
    M --> N[Вернуть success + id заявки]
    N --> O[Frontend показывает\nсообщение об успешном создании]
```

## 2. Диаграмма последовательности

Сценарий: создание новой заявки на ремонт.

```mermaid
sequenceDiagram
    actor Admin as Администратор
    participant UI as React UI\nNewRequestForm
    participant API as requestsApi
    participant BE as Express API
    participant VAL as Zod validation
    participant CTRL as requestsController
    participant CM as ClientModel
    participant RM as RepairRequestModel
    participant DB as SQLite/PostgreSQL

    Admin->>UI: Заполняет форму и нажимает "Создать заявку"
    UI->>UI: Локальная проверка полей
    alt Форма невалидна
        UI-->>Admin: Показать ошибки
    else Форма валидна
        UI->>API: create(payload)
        API->>BE: POST /api/requests
        BE->>VAL: validateRequestCreate
        alt Payload невалиден
            VAL-->>BE: Ошибка валидации
            BE-->>API: 400/422 + error
            API-->>UI: Error
            UI-->>Admin: Сообщение об ошибке
        else Payload валиден
            VAL-->>CTRL: Нормализованный payload
            CTRL->>CM: findByPhone / create
            CM->>DB: SELECT / INSERT clients
            DB-->>CM: client
            CTRL->>RM: create(request)
            RM->>DB: INSERT repair_requests
            DB-->>RM: созданная запись
            RM-->>CTRL: request
            CTRL-->>BE: success response
            BE-->>API: 201 + request
            API-->>UI: success
            UI-->>Admin: Показать ID новой заявки
        end
    end
```

## 3. Диаграмма состояний

Жизненный цикл заявки на ремонт по статусам, которые зафиксированы в БД.

```mermaid
stateDiagram-v2
    [*] --> new: Создание заявки
    new --> in_progress: Принята в работу
    new --> waiting_parts: Нужны запчасти сразу
    new --> cancelled: Отмена

    in_progress --> waiting_parts: Выявлена нехватка запчастей
    waiting_parts --> in_progress: Запчасти получены

    in_progress --> completed: Ремонт завершен
    waiting_parts --> completed: Завершено после поставки

    in_progress --> cancelled: Клиент отказался / ремонт остановлен
    waiting_parts --> cancelled: Отказ до завершения

    completed --> [*]
    cancelled --> [*]
```

## 4. Архитектура приложения

Высокоуровневая архитектура: SPA-клиент, REST API и БД.

```mermaid
flowchart LR
    U[Пользователь / Администратор]
    FE[Frontend SPA\nReact + Vite + TypeScript]
    HOOKS[Hooks и состояние\nuseRequests / useClientsData /\nuseEmployeesData / useFinanceData]
    API[API client layer\nsrc/services/api]
    BE[Backend API\nNode.js + Express + TypeScript]
    RT[Routes + Controllers + Validation]
    MODELS[Models + DB abstraction]
    DB[(SQLite fallback\nили PostgreSQL)]

    U --> FE
    FE --> HOOKS
    HOOKS --> API
    API --> BE
    BE --> RT
    RT --> MODELS
    MODELS --> DB
```

## 5. Диаграмма компонентов

Внутреннее разбиение по основным компонентам и связям.

```mermaid
flowchart TB
    subgraph Frontend
        APP[App.tsx]
        LAYOUT[Header + Sidebar]
        PAGES[Pages\nDashboard / Requests / NewRequest /\nClients / Employees / Inventory /\nFinance / Reports / Calendar]
        FORM[NewRequestForm / LoginRegisterPage]
        FH[Hooks\nuseAuthSession / useRequests /\nuseClientsData / useEmployeesData /\nuseFinanceData / useReportsData]
        FAPI[API Services\nclient.ts / auth.ts / requests.ts /\nclients.ts / employees.ts / finance.ts]

        APP --> LAYOUT
        APP --> PAGES
        PAGES --> FORM
        PAGES --> FH
        FORM --> FAPI
        FH --> FAPI
    end

    subgraph Backend
        BAPP[createApp + middleware]
        ROUTES[routes/index.ts]
        CTRL[Controllers\nauth / requests / clients /\nemployees / inventory / finance / stats]
        VALID[Zod validation]
        MODEL[Models\nUser / Client / Employee /\nRepairRequest / Transaction / Inventory]
        DBL[DB layer\ndb.ts + schema.sql + bootstrap]

        BAPP --> ROUTES
        ROUTES --> VALID
        ROUTES --> CTRL
        CTRL --> MODEL
        MODEL --> DBL
    end

    FAPI -->|HTTP JSON| BAPP
```

## 6. Диаграмма развертывания

Локальный сценарий запуска проекта, который сейчас используется в репозитории.

```mermaid
flowchart LR
    Browser[Браузер пользователя]

    subgraph Workstation["Локальная машина разработчика / сервер"]
        VITE[Vite dev server\n127.0.0.1:3000]
        EXPRESS[Express backend\n127.0.0.1:3001]
        SQLITE[(SQLite file\nserver/database/kalakutsky.db)]
        PG[(PostgreSQL)\nопционально]
    end

    Browser -->|HTTP| VITE
    VITE -->|REST API / JSON| EXPRESS
    EXPRESS --> SQLITE
    EXPRESS -. при DB_CLIENT=postgres .-> PG
```

## 7. ER-диаграмма базы данных

Диаграмма построена по `server/src/database/schema.sql`.

```mermaid
erDiagram
    USERS {
        TEXT id PK
        TEXT username UK
        TEXT email UK
        TEXT password_hash
        TEXT user_type
        TEXT name
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    CLIENTS {
        TEXT id PK
        TEXT name
        TEXT phone
        TEXT email
        TEXT address
        TEXT notes
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    EMPLOYEES {
        TEXT id PK
        TEXT name
        TEXT position
        TEXT specialization
        TEXT phone
        TEXT email
        TEXT status
        INTEGER completed_repairs
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    REPAIR_REQUESTS {
        TEXT id PK
        TEXT client_id FK
        TEXT client_name
        TEXT client_phone
        TEXT client_email
        TEXT device_type
        TEXT device_model
        TEXT serial_number
        TEXT problem
        TEXT status
        TEXT priority
        TEXT assigned_to FK
        DOUBLE estimated_cost
        DOUBLE actual_cost
        TEXT notes
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
        TIMESTAMPTZ completed_at
    }

    TRANSACTIONS {
        TEXT id PK
        TEXT request_id FK
        TEXT type
        TEXT description
        DOUBLE amount
        TIMESTAMPTZ date
        TIMESTAMPTZ created_at
    }

    INVENTORY {
        TEXT id PK
        TEXT name
        TEXT category
        INTEGER quantity
        INTEGER min_quantity
        DOUBLE unit_price
        TEXT supplier
        TEXT notes
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    CLIENTS ||--o{ REPAIR_REQUESTS : "has"
    EMPLOYEES ||--o{ REPAIR_REQUESTS : "assigned to"
    REPAIR_REQUESTS ||--o{ TRANSACTIONS : "generates"
```

## Примечания

- Диаграмма состояний отражает типовой бизнес-сценарий. Технически API обновления заявки допускает более свободные переходы статусов.
- `users` сейчас не связан внешними ключами с остальными сущностями и используется для аутентификации.
- `inventory` в текущей схеме существует отдельно от `repair_requests`, то есть расход запчастей по заявке пока не моделируется отдельной связующей таблицей.
