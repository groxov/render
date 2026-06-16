# Production deployment

This project is prepared for a simple production deployment with:

- `web`: Nginx serving the built Vite frontend
- `api`: Node.js / Express backend
- `uptime-kuma`: optional uptime/status monitoring UI
- `beszel` and `beszel-agent`: optional server/container metrics and alerts
- `sqlite` volume by default, or PostgreSQL if configured in `server/.env`

## 1. Prepare env

Copy `server/.env.example` to `server/.env` and set at least:

```env
NODE_ENV=production
JWT_SECRET=your-strong-secret
DB_CLIENT=sqlite
DB_PATH=./database/kalakutsky.db
```

If you want PostgreSQL instead:

```env
NODE_ENV=production
JWT_SECRET=your-strong-secret
DB_CLIENT=postgres
DATABASE_URL=postgresql://user:password@host:5432/kalakutsky_repair
PG_SSL=true
```

## 2. Build and start

From the repo root:

```bash
docker compose -f deploy/docker-compose.prod.yml up -d --build
```

## 3. Start monitoring

Uptime Kuma and Beszel are behind the `monitoring` profile so the main app can still start without monitoring secrets.

```bash
cp deploy/monitoring.env.example deploy/monitoring.env
docker compose --env-file deploy/monitoring.env -f deploy/docker-compose.prod.yml --profile monitoring up -d --build
```

Monitoring URLs:

- Uptime Kuma: `http://YOUR_HOST:3001`
- Beszel Hub: `http://YOUR_HOST:8090`

Recommended Uptime Kuma monitors:

- Web: `http://web/`
- API health: `http://api:3001/health`
- Public health, if available through your domain: `http://YOUR_DOMAIN/health`

Beszel setup:

1. Open Beszel Hub and create the admin user.
2. Add a local system in the Beszel UI.
3. Copy the generated token and public key into `deploy/monitoring.env` as `BESZEL_TOKEN` and `BESZEL_KEY`.
4. Restart the agent:

```bash
docker compose --env-file deploy/monitoring.env -f deploy/docker-compose.prod.yml --profile monitoring up -d beszel-agent
```

When adding the local system in Beszel, use this Host / IP value:

```text
/beszel_socket/beszel.sock
```

## 4. Check health

```bash
curl http://YOUR_DOMAIN/health
curl http://YOUR_DOMAIN/api/requests
```

## Notes

- Frontend talks to backend through `/api`, so the browser does not need a separate backend hostname.
- Default compose file exposes port `80`.
- Monitoring profile exposes ports `3001` for Uptime Kuma and `8090` for Beszel by default.
- Beszel agent mounts `/var/run/docker.sock` read-only to collect container stats.
- Beszel local socket mode is intended for a Linux Docker host. On Windows Docker Desktop, use a remote-agent setup if host networking or the Docker socket is unavailable.
- For HTTPS, place this stack behind a reverse proxy or add TLS termination in front of Nginx.
- SQLite is acceptable for a small demo/low-load deployment. For real production usage, prefer PostgreSQL.
