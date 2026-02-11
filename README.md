
# Wallet System API
### LIVE ON :  https://wallet-system-api-kq62.onrender.com

A secure, production-ready **backend API** for a digital wallet application built with **NestJS**, **TypeORM**, **PostgreSQL** (hosted on Supabase), **JWT authentication**, **Role-Based Access Control (RBAC)**, **OTP email verification**, wallet funding, and peer-to-peer transfers.

The system supports:
- User registration + auto wallet creation
- Email + password login
- OTP-based verification (via Gmail or any SMTP)
- Wallet funding (simulated)
- Internal transfers between users (identified by email)
- Transaction history
- Admin panel (list users & all transactions)

Designed with **clean architecture**, **data integrity** (via transactions), **input validation**, and **security best practices**.



## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Database & Migrations](#database--migrations)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Testing with Postman](#testing-with-postman)
- [Security Considerations](#security-considerations)
- [Folder Structure](#folder-structure)
- [Common Issues & Troubleshooting](#common-issues--troubleshooting)
- [Future Improvements](#future-improvements)
- [License](#license)

## Features

- **User Management**
  - Register (email/password) → auto-creates wallet
  - Login → JWT token
  - OTP generation & verification (email)
  - Resend OTP

- **Wallet Operations**
  - View own wallet balance
  - Fund wallet (simulated credit)

- **Transfers**
  - Send money to another user (by email)
  - Atomic debit/credit + transaction logging

- **Transactions**
  - View personal transaction history
  - Full audit log for admins

- **Admin Features** (RBAC protected)
  - List all users
  - View user details
  - List all transactions
  - View single transaction

- **Security**
  - JWT authentication
  - Role-based access (user vs admin)
  - Password hashing (bcrypt)
  - Input validation (class-validator)
  - Transactional integrity (TypeORM)

## Tech Stack

| Layer              | Technology                          | Purpose                              |
|--------------------|-------------------------------------|--------------------------------------|
| Framework          | NestJS 10+                          | Structured, scalable Node.js backend |
| Language           | TypeScript                          | Type safety                          |
| ORM                | TypeORM 0.3+                        | Database abstraction & migrations    |
| Database           | PostgreSQL (Supabase hosted)        | Relational storage                   |
| Auth               | @nestjs/jwt + passport-jwt          | JWT tokens                           |
| Password Hashing   | bcrypt                              | Secure password storage              |
| OTP                | speakeasy                           | Time-based OTP generation            |
| Email              | nodemailer                          | Sending OTP emails                   |
| Validation         | class-validator + class-transformer | DTO validation                       |
| Config             | @nestjs/config                      | .env management                      |
| Hosting/DB         | Supabase (PostgreSQL)               | Managed Postgres + auth potential    |

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- Git
- Supabase account & project (free tier is enough)
- Gmail account with **App Password** enabled (for OTP emails)

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/wallet-system.git
cd wallet-system

# 2. Install dependencies
npm install

# 3. Copy example env file
cp .env.example .env
```

## Environment Variables (.env)

Create or update `.env` with your values:

```env
# Supabase PostgreSQL connection (use pooler URL!)
SUPABASE_DB_URL=postgresql://postgres.[your-project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres

# JWT
JWT_SECRET=super-long-random-secret-change-this-2026

# Email (Gmail App Password required!)
EMAIL_USER=yourname@gmail.com
EMAIL_PASS=abcdefghijklmnop   # ← 16-char App Password, NOT normal password

# Optional (for production)
PORT=3000
NODE_ENV=development
```

> **Important**: Never commit `.env` to git. Use `.env.example` as template.

## Running the Application

```bash
# Development mode (with hot-reload)
npm run start:dev

# Build & production mode
npm run build
npm run start:prod
```

Default URL: `http://localhost:3000`

## Database & Migrations

In development, `synchronize: true` is enabled (auto-creates tables).

For production:

```bash
# Generate migration
npm run typeorm migration:generate -- -n InitialSchema

# Run migrations
npm run typeorm migration:run
```

## API Endpoints

Base URL: `http://localhost:3000`

### Auth

| Method | Endpoint              | Description                     | Auth? |
|--------|-----------------------|---------------------------------|-------|
| POST   | `/auth/register`      | Register + auto wallet          | No    |
| POST   | `/auth/login`         | Login → get JWT                 | No    |
| POST   | `/auth/send-otp`      | Send OTP                        | Yes   |
| POST   | `/auth/verify-otp`    | Verify OTP                      | Yes   |
| POST   | `/auth/resend-otp`    | Resend OTP                      | Yes   |
| POST   | `/auth/logout`        | Logout (client-side mostly)     | Yes   |

### Wallet

| Method | Endpoint              | Description                     | Auth? | Role  |
|--------|-----------------------|---------------------------------|-------|-------|
| GET    | `/wallets/my-wallet`  | View own wallet                 | Yes   | user  |
| POST   | `/wallets/fund`       | Add money (simulated)           | Yes   | user  |

### Transfers & Transactions

| Method | Endpoint              | Description                     | Auth? | Role  |
|--------|-----------------------|---------------------------------|-------|-------|
| POST   | `/transfers`          | Transfer to another user (email)| Yes   | user  |
| GET    | `/transactions`       | Own transaction history         | Yes   | user  |

### Admin (RBAC protected)

| Method | Endpoint                       | Description                     | Auth? | Role  |
|--------|--------------------------------|---------------------------------|-------|-------|
| GET    | `/admin/users`                 | List all users                  | Yes   | admin |
| GET    | `/admin/users/:id`             | User details + wallet           | Yes   | admin |
| GET    | `/admin/transactions`          | All transactions                | Yes   | admin |
| GET    | `/admin/transactions/:id`      | Single transaction details      | Yes   | admin |

## Authentication Flow

1. Register → user created + wallet auto-created
2. Login → receive JWT
3. Send OTP → email received
4. Verify OTP → account verified
5. Use JWT on protected endpoints

## Testing with Postman

1. Import the collection (or create manually)
2. Set collection variable: `accessToken`
3. After login → save token to variable
4. Use `Bearer {{accessToken}}` in Authorization tab

Recommended sequence:
- Register
- Login
- Send OTP → check email
- Verify OTP
- Fund wallet
- Transfer to another test user
- Check transactions
- Switch to admin token → test admin endpoints

## Security Considerations

- Use **strong** `JWT_SECRET` (≥ 64 chars)
- **App Password** for Gmail (not normal password)
- Rate limiting missing → add `@nestjs/throttler`
- Production: HTTPS + CORS restrictions
- Disable `synchronize: true`
- Use migrations
- Validate all inputs
- Never log passwords/OTPs

## Folder Structure

```text
src/
├── auth/                  # Authentication logic
│   ├── dto/
│   ├── strategies/
│   └── ...
├── entities/              # TypeORM entities (User, Wallet, Transaction)
├── wallet/
├── transaction/
├── admin/
├── guards/                # JwtAuthGuard, RolesGuard
├── decorators/
├── common/                # filters, interceptors, pipes (if added)
├── app.module.ts
└── main.ts
```

Follows **NestJS modular architecture** + domain-driven style.

## Common Issues & Troubleshooting

| Issue                                      | Likely Cause                              | Fix                                      |
|--------------------------------------------|-------------------------------------------|------------------------------------------|
| ENOTFOUND db.*.supabase.co                 | Wrong DB URL                              | Use pooler: aws-*-pooler.supabase.com:6543 |
| DataTypeNotSupportedError "Object"         | Nullable union without explicit type      | Add `type: 'varchar'` / `timestamp`      |
| Email not sending                          | Wrong App Password / Gmail blocks         | Generate new App Password + use port 587 |
| 403 on admin routes                        | User role ≠ 'admin'                       | Set role='admin' in DB                   |
| Balance not updating                       | Transaction rollback                      | Check logs for exceptions                |

## Future Improvements

- Pagination & filtering on lists
- Real payment gateway integration (Paystack/Flutterwave)
- Rate limiting & throttling
- Refresh tokens
- Email templates (Handlebars/MJML)
- Swagger/OpenAPI docs (`@nestjs/swagger`)
- Docker + docker-compose
- CI/CD (GitHub Actions)
- Unit & e2e tests (Jest)
- Redis caching
- Webhooks / real-time (Supabase Realtime)
