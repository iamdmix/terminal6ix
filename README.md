# TerminalSix — CTF Platform

A full-stack Capture The Flag platform: FastAPI + PostgreSQL backend, Next.js 14 frontend.
Players register for events, solve challenges by submitting flags, and climb a live leaderboard.
Organisers create events, set each event's flag format, manage challenges — including
dockerised services — and watch the rankings in real time.

## Features

**Auth & roles**
- Email/password auth (JWT, bcrypt)
- `participant` and `organiser` roles with enforced permissions

**Dynamic CTF engine**
- Events with start/end windows, live status (upcoming / live / ended) and countdowns
- **Per-event flag format** — organisers set a prefix (e.g. `T6{`, `dad{`); submissions not
  matching it are rejected with a clear message
- Challenges in 7 categories (web, crypto, reverse, forensics, pwn, osint, misc), 4 difficulty
  tiers, hints, optional live-service URL (e.g. a dockerised challenge) and attachment URL
- Flag submission with every attempt recorded; first correct solve scores the full points
- Event registration required to submit; submissions close when the event ends
- Live leaderboard: podium + rankings, last-solve tiebreak, auto-refresh every 15s

**Frontend**
- Phosphor-terminal design system: warm charcoal, amber signal, mono data, tmux-style
  status bar with UTC clock, API pulse and next-event countdown
- `/` — landing with live platform stats
- `/events` — event index with live/registration state
- `/events/[id]` — the play page: challenge directory, filters, hints, flag submission, attempt log
- `/dashboard` — participant view: per-event progress, points, recent solves
- `/host` — organiser console: events, challenge CRUD (flags visible), top-3 board
- `/leaderboard` — event tabs, podium, dense rankings
- Old routes `/challenges` and `/community` redirect to `/events`

## Project structure

```
backend/
  app/
    main.py               # FastAPI app, CORS, routers, /health, /stats
    database.py           # SQLAlchemy engine/session
    migrations.py         # idempotent additive migrations
    api/deps.py           # get_current_user, require_organiser, require_participant
    api/endpoints/
      users.py            # /auth/signup, /auth/login, /auth/me, /auth/me/solves
      events.py           # /events CRUD with live counters
      registrations.py    # /events/{id}/register, /events/{id}/leaderboard
      challenges.py       # /events/{id}/challenges CRUD, /challenges/{id}/submit
    models/               # User, Event, Challenge, Submission, EventRegistration
    schemas/              # Pydantic schemas
    services/             # auth_service (JWT/bcrypt), user_service
    seed.py               # demo data (2 events incl. NotDad OSINT)
  tests/                  # pytest suite (23 tests)
frontend/
  app/                    # Next.js App Router pages
  components/             # app shell, ui-kit, auth-provider, shadcn primitives
  lib/                    # api client, types, hooks
```

## Quickstart

### 1. Database

Any PostgreSQL 14+. Example with Docker:

```bash
docker run -d --name terminal6ix-db \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=terminal6ix \
  -p 5432:5432 postgres:16-alpine
```

### 1b. Dockerised challenge (NotDad OSINT demo)

The seeded event **"NotDad — An OSINT Story"** includes a challenge that links to a live
dockerised OSINT quiz ([iamdmix/not-dad](https://github.com/iamdmix/not-dad)). Players answer
ten questions about a fictional rally driver inside the container and the service hands back
the flag — which must match the seeded flag (event format: `dad{`):

```bash
git clone https://github.com/iamdmix/not-dad /tmp/not-dad
docker build -t notdad /tmp/not-dad
docker run -d --name notdad -p 8080:8080 notdad \
  sh -c "/root/gen_flag 'dad{0s1nt_1s_n0t_st4lk1ng}' && python main.py"
```

Then open http://localhost:8080 and solve. The `service url` field on any challenge
(editable in the host console) is how you wire in your own dockerised challenges.

### 2. Backend

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt pytest httpx

cp .env.example .env          # then edit SECRET_KEY / DATABASE_URL

# create tables + seed demo data
.venv/bin/python -m app.seed

# run
.venv/bin/uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

Demo accounts after seeding:

| Email | Password | Role |
|---|---|---|
| organiser@terminal6ix.dev | organiser123 | organiser |
| player@terminal6ix.dev | player123 | participant |

### 3. Frontend

```bash
cd frontend
pnpm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL points to the backend
pnpm dev
```

Open http://localhost:3000

### 4. Run backend tests

```bash
cd backend
# tests use a separate database; create it once:
docker exec terminal6ix-db psql -U postgres -c "CREATE DATABASE terminal6ix_test;"

DATABASE_URL="postgresql+psycopg2://postgres:postgres@localhost:5432/terminal6ix_test" \
SECRET_KEY="testsecret" \
.venv/bin/python -m pytest
```

## Environment variables

**backend** (`.env`, loaded via python-dotenv)

| Variable | Default | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql+psycopg2://postgres:postgres@localhost:5432/postgres` | SQLAlchemy URL |
| `SECRET_KEY` | — (required) | Generate: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ACCESS_TOKEN_EXPIRY_HOURS` | `12` | JWT lifetime |
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Comma-separated |

**frontend** (`.env.local`)

| Variable | Default |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` |

## API overview

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | — | Register (role: participant/organiser) |
| POST | `/auth/login` | — | Get JWT |
| GET | `/auth/me` | ✓ | Current user |
| GET | `/auth/me/solves` | ✓ | Current user's correct solves |
| GET | `/events/` | ✓ | All events + live counters |
| GET | `/events/me` | ✓ | Events I'm registered for |
| GET | `/events/{id}` | ✓ | Event detail + counters |
| POST/PUT/DELETE | `/events/…` | organiser | Manage own events |
| POST | `/events/{id}/register` | ✓ | Register for event |
| DELETE | `/events/{id}/register` | ✓ | Unregister |
| GET | `/events/{id}/registrations` | ✓ | Registration list |
| GET | `/events/{id}/leaderboard` | ✓ | Ranked scores |
| GET | `/events/{id}/challenges` | ✓ | Active challenges (filterable) |
| GET | `/events/{id}/challenges/all` | organiser | All incl. flags (own events) |
| POST/PUT/DELETE | `/events/{id}/challenges/…` | organiser | Manage challenges |
| GET | `/events/{id}/challenges/{cid}` | ✓ (registered) | Single challenge |
| POST | `/challenges/{cid}/submit` | ✓ (registered) | Submit flag |
| GET | `/challenges/{cid}/submissions` | ✓ | My attempts |
| GET | `/stats` | — | Public platform counters |
| GET | `/health` | — | Health check |
