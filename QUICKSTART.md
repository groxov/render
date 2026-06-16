# QUICKSTART

## 1. Установить зависимости

### Backend
```bash
cd server
npm install
```

### Frontend
```bash
npm install
```

## 2. Подготовить backend env

Скопируй `server/.env.example` в `server/.env`.

### Вариант с PostgreSQL
```env
DB_CLIENT=postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/kalakutsky_repair
PG_SSL=false
```

### Временный fallback без PostgreSQL
```env
DB_CLIENT=sqlite
DB_PATH=./database/kalakutsky.db
```

## 3. Запустить backend

```bash
cd server
npm run dev
```

Backend будет доступен на `http://localhost:3001`.

## 4. Запустить frontend

В отдельном терминале:

```bash
npm run dev
```

Frontend будет доступен на `http://localhost:3000`.

## 5. Войти в систему

- логин: `admin`
- пароль: `admin123`

## DBeaver

Если backend работает через `DB_CLIENT=postgres`, в DBeaver используй те же параметры, что и в `DATABASE_URL`:

- Host: `localhost`
- Port: `5432`
- Database: `kalakutsky_repair`
- Username: `postgres`
- Password: `postgres`

## Полезные команды

```bash
npm run build
npm run build:server
npm run build:all
npm run typecheck
```

## Примечание

Если PostgreSQL уже поднят, backend будет работать с ним, и ты сможешь смотреть таблицы через DBeaver. Если Postgres пока не настроен, можно временно оставить SQLite fallback, чтобы проект продолжал запускаться локально без остановки разработки.
