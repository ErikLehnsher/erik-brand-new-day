# Erik Brand New Day

Erik Brand New Day is Erik's personal digital home: a public-facing social and
editorial platform for stories, daily logs, future calendar tools, and private
personal utilities.

It is deliberately separate from Friday Agent. Friday is the local-first agent
runtime; Telegram is one test adapter. The website is the public product
surface. They can live on the same server without exposing Friday's admin panel,
agent workspaces, Claude credentials, or Telegram control plane.

## Services

- `FE/`: Next.js frontend
- `BE/`: FastAPI backend

Production also uses PostgreSQL and Caddy. The web app is served at
`https://snakersdoo.io.vn`; browser API traffic stays same-origin at `/api`.

```text
Browser
  └─ https://snakersdoo.io.vn
       └─ Caddy gateway
            ├─ Next.js frontend
            └─ /api/* → FastAPI backend → PostgreSQL

Friday Agent is a separate private service on the same server.
It is not proxied publicly and has no website API contract yet.
```

## Local setup

Edit `.env.local` directly for local development.

The backend reads `.env.local` first, then falls back to `.env`.

Use `.env.local` for development and `.env.example` as the server/deploy template.

## Ports

- FE: `http://localhost:3000`
- BE: `http://localhost:8000`

## Windows server deployment

The production compose file is intentionally separate from Friday Agent. Clone
both repositories into different folders on the server, for example:

```text
D:\Apps\erik-brand-new-day
D:\Apps\friday_agent
```

From `D:\Apps\erik-brand-new-day`, create the production environment file:

```powershell
Copy-Item .env.production.example .env.production
```

Set a unique PostgreSQL password, a long random `SECRET_KEY`, and a real
`ACME_EMAIL`. Do not commit `.env.production`.

Create the shared network once (it is reserved for a future authenticated
Friday bridge; the current Friday admin service is not exposed through it):

```powershell
docker network create friday-platform
```

Then build and start the website:

```powershell
docker compose -f docker-compose.production.yml up -d --build
```

The gateway needs ports 80 and 443 available. Point the DNS record for
`snakersdoo.io.vn` to this server. Caddy obtains and renews HTTPS certificates
automatically when Cloudflare/DNS allows inbound HTTP and HTTPS to reach the
server. If an existing Cloudflare Tunnel or another proxy already owns ports 80
or 443, do not start this gateway until its routing is chosen deliberately.

Useful checks:

```powershell
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs -f gateway
docker compose -f docker-compose.production.yml logs -f backend
```

## Friday integration boundary

Friday remains private while the web application's user identity and permission
model mature. The first website integration should be an authenticated backend
bridge that maps a signed-in Brand New Day user to one isolated Friday workspace.
It must never expose the Telegram token, Claude/Codex credentials, raw session
folders, or the Friday admin dashboard to the browser. That bridge is the next
feature, not a reverse-proxy shortcut.
