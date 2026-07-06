# NexDesk Test Credentials

Development-only accounts created by the seed scripts. Do not use these passwords in production.

## Setup

```bash
cd backend
npm run seed:tenants
npm run seed:users
```

Override defaults in `backend/.env`:

```env
SEED_MASTER_EMAIL=master@worzest.com
SEED_MASTER_PASSWORD=Master123!
SEED_ADMIN_PASSWORD=Admin123!
SEED_CUSTOMER_PASSWORD=Customer123!
```

## Domain layout (local)

| Level   | URL |
| ------- | --- |
| Master  | http://localhost:5173/master |
| NexDesk | http://nexdesk.localhost:5173 |
| Tenant  | http://{subdomain}.nexdesk.localhost:5173 |

Production uses `worzest.com` as the root domain (e.g. `https://abc.nexdesk.worzest.com`).

---

## Master

| Field    | Value |
| -------- | ----- |
| URL      | http://localhost:5173/master |
| Email    | master@worzest.com |
| Password | Master123! |
| Role     | Master |

---

## ABC Corporation (`abc`)

| Field    | Admin | Customer |
| -------- | ----- | -------- |
| URL      | http://abc.nexdesk.localhost:5173/login | http://abc.nexdesk.localhost:5173/login |
| Email    | admin@abc.nexdesk.localhost | customer@abc.nexdesk.localhost |
| Password | Admin123! | Customer123! |
| Role     | Admin | Customer |

**Production URL:** https://abc.nexdesk.worzest.com/login

---

## XYZ Industries (`xyz`)

| Field    | Admin | Customer |
| -------- | ----- | -------- |
| URL      | http://xyz.nexdesk.localhost:5173/login | http://xyz.nexdesk.localhost:5173/login |
| Email    | admin@xyz.nexdesk.localhost | customer@xyz.nexdesk.localhost |
| Password | Admin123! | Customer123! |
| Role     | Admin | Customer |

**Production URL:** https://xyz.nexdesk.worzest.com/login

---

## Quick reference

| Role     | Email                              | Password     |
| -------- | ---------------------------------- | ------------ |
| Master   | master@worzest.com                 | Master123!   |
| Admin    | admin@abc.nexdesk.localhost        | Admin123!    |
| Admin    | admin@xyz.nexdesk.localhost        | Admin123!    |
| Customer | customer@abc.nexdesk.localhost     | Customer123! |
| Customer | customer@xyz.nexdesk.localhost     | Customer123! |
