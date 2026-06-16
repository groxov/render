# OnRender Repair Desk

Render-ready full-stack repair desk app.

## Stack

- React + TypeScript + Vite frontend
- Node.js + Express + TypeScript backend
- PostgreSQL on Render
- SQLite fallback for local development
- Optional Docker Compose deployment with Uptime Kuma and Beszel monitoring

## Local Development

Install dependencies:

```bash
npm install
npm --prefix server install
```

Prepare backend env:

```bash
copy server\.env.example server\.env
```

Start backend:

```bash
npm run dev:server
```

Start frontend in another terminal:

```bash
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Backend health: `http://localhost:3001/health`

Test account:

- Login: `admin`
- Password: `admin123`

## Deploy To Render

This repo includes a Render Blueprint in `render.yaml`.

The blueprint creates:

- `onrender-web`: Docker/Nginx frontend
- `onrender-api`: Node backend
- `onrender-db`: managed PostgreSQL database

Deployment flow:

1. Push this folder to a GitHub/GitLab/Bitbucket repository.
2. In Render, create a new Blueprint from that repository.
3. Render reads `render.yaml`, creates the services, and injects `DATABASE_URL` and `JWT_SECRET`.
4. When Render asks for `ADMIN_PASSWORD`, enter a strong first-admin password.

The frontend is built with `VITE_API_URL=https://onrender-api.onrender.com/api` and talks to the public API service.
The frontend container explicitly binds Nginx to port `80` with `PORT=80` in `render.yaml`.

## Production Docker Compose

For a non-Render Docker host:

```bash
copy server\.env.example server\.env
docker compose -f deploy/docker-compose.prod.yml up -d --build
```

Optional monitoring:

```bash
copy deploy\monitoring.env.example deploy\monitoring.env
docker compose --env-file deploy/monitoring.env -f deploy/docker-compose.prod.yml --profile monitoring up -d --build
```

Monitoring URLs:

- Uptime Kuma: `http://YOUR_HOST:3001`
- Beszel: `http://YOUR_HOST:8090`
