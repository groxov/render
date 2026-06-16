# Kalakutsky Service Backend API

Backend для системы управления ремонтом техники.

## Технологии

- Node.js + Express
- TypeScript
- PostgreSQL
- SQLite fallback для локального режима без Postgres
- JWT
- bcryptjs

## Установка

```bash
cd server
npm install
```

## Настройка `.env`

Можно взять за основу `server/.env.example`.

### PostgreSQL
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
DB_CLIENT=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kalakutsky_repair
PG_SSL=false
```

### SQLite fallback
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
DB_CLIENT=sqlite
DB_PATH=./database/kalakutsky.db
```

## Запуск

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Production
```bash
npm start
```

Backend будет доступен на `http://localhost:3001`.

## DBeaver

Если backend работает через `DB_CLIENT=postgres`, то DBeaver подключается к той же базе по параметрам из `DATABASE_URL`.

Пример:
- Host: `localhost`
- Port: `5432`
- Database: `kalakutsky_repair`
- Username: `postgres`
- Password: `postgres`

## Тестовый аккаунт

- логин: `admin`
- пароль: `admin123`

## API

### Auth
- `POST /api/auth/login`
- `POST /api/auth/register`

### Requests
- `GET /api/requests`
- `GET /api/requests/:id`
- `POST /api/requests`
- `PUT /api/requests/:id`
- `DELETE /api/requests/:id`

### Clients
- `GET /api/clients`
- `GET /api/clients/:id`
- `POST /api/clients`
- `PUT /api/clients/:id`
- `DELETE /api/clients/:id`

### Employees
- `GET /api/employees`
- `GET /api/employees/:id`
- `POST /api/employees`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`

### Finance
- `GET /api/finance/transactions`
- `GET /api/finance/stats`
- `POST /api/finance/transactions`
- `DELETE /api/finance/transactions/:id`

### Inventory
- `GET /api/inventory`
- `GET /api/inventory/:id`
- `POST /api/inventory`
- `PUT /api/inventory/:id`
- `DELETE /api/inventory/:id`

### Stats
- `GET /api/stats/dashboard`
- `GET /api/stats/requests`
