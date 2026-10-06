# RMS — Restaurant Management System

A full-stack restaurant management system covering order-taking, kitchen/bar
queues, payments (including Bakong KHQR), stock, and staff management.

## Roles

| Role | What they do |
|---|---|
| **Admin** | Manage menu, tables, stock, suppliers, staff accounts, view reports |
| **Server** (shown as "Waiter" in the UI) | Pick a table, build an order from the menu, submit it |
| **Cashier** | Take orders, process payments (Cash / Card / KHQR), view daily reports |
| **Kitchen** | View and work through incoming food orders |
| **Barista** | View and work through incoming drink orders |

## Tech stack

**Backend** — Node.js, Express, PostgreSQL via Prisma ORM, Socket.io for
real-time order/table updates, JWT auth (httpOnly cookie), `bcrypt` for
passwords, Bakong KHQR for QR payments, Telegram bot for notifications.

**Frontend** — React + Vite, Tailwind CSS, Zustand for state, React Router,
English/Khmer i18n, light/dark theme.

## Project structure

```
RMS/
├── backend/     Express API + Prisma schema
└── frontend/    React app
```

## Getting started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in real values — see below
npx prisma db push     # creates/updates the database schema
node prisma/seed.js    # optional: seeds categories, tables, one login per role, payment methods
npm start
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment variables (`backend/.env`)

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Any long random string |
| `PORT` | No | Defaults to 8080 |
| `CLIENT_URL` | Yes | Frontend origin, for CORS |
| `BAKONG_TOKEN` | For KHQR payments | Bakong API token |
| `KHQR_MERCHANT_CITY` | For KHQR payments | Merchant city for the KHQR payload |
| `KHQR_MERCHANT_NAME` | For KHQR payments | Merchant name for the KHQR payload |
| `TELEGRAM_BOT_TOKEN` | For notifications | Only if Telegram alerts are enabled |
| `TELEGRAM_CHAT_ID` | For notifications | Only if Telegram alerts are enabled |
| `SEED_PASSWORD` | No | Password for all seeded dev accounts; falls back to a default with a warning if unset — never commit a real value here |

See `backend/.env.example` for a ready-to-copy template.

## Database

Schema lives in `backend/prisma/schema.prisma`. After changing it, apply
with `npx prisma db push` (this project uses db-push rather than tracked
migrations — see comments in `order.controller.js`).

## License

_Not yet set — add a `LICENSE` file before treating this as open source.
Until then, all rights are reserved by default._
