# IMP-002 --- Backend Foundation

**Document ID:** IMP-002\
**Version:** 1.0\
**Status:** Approved\
**Project:** Solaís Lifestyle Platform

## Purpose

This document provides the implementation sequence for establishing the
production-ready Node.js, TypeScript and Express backend foundation.

## Prerequisites

-   Node.js 22 LTS
-   npm 10+
-   Git
-   PostgreSQL 16+
-   Visual Studio Code

## 1. Initialize the Backend

``` bash
mkdir backend
cd backend
npm init -y
```

## 2. Install Production Dependencies

``` bash
npm install express cors helmet compression cookie-parser dotenv jsonwebtoken bcrypt zod @prisma/client winston express-rate-limit
```

  Package              Purpose
  -------------------- ------------------------------------
  express              REST API and middleware
  cors                 Cross-origin access control
  helmet               Security headers
  compression          Response compression
  cookie-parser        Refresh-token cookies
  dotenv               Local environment variables
  jsonwebtoken         JWT signing and verification
  bcrypt               Password hashing
  zod                  Environment and request validation
  @prisma/client       Type-safe database client
  winston              Structured logging
  express-rate-limit   Abuse and brute-force protection

Defer Cloudinary, Multer, QR, email and payment SDKs until their feature
phases.

## 3. Install Development Dependencies

``` bash
npm install -D typescript tsx prisma eslint @eslint/js typescript-eslint prettier vitest supertest @types/node @types/express @types/cors @types/compression @types/cookie-parser @types/jsonwebtoken @types/bcrypt @types/supertest
```

## 4. Configure package.json

Set `"type": "module"` and add:

``` json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

## 5. Backend Structure

``` text
backend/
├── prisma/
├── src/
│   ├── config/
│   ├── middleware/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── events/
│   │   ├── tickets/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── vendors/
│   │   ├── partners/
│   │   ├── gallery/
│   │   ├── journal/
│   │   ├── notifications/
│   │   ├── analytics/
│   │   └── health/
│   ├── shared/
│   │   ├── constants/
│   │   ├── errors/
│   │   ├── logger/
│   │   ├── responses/
│   │   ├── types/
│   │   └── utils/
│   ├── app.ts
│   └── server.ts
├── tests/
├── .env
├── .env.example
├── .gitignore
├── .prettierignore
├── .prettierrc.json
├── eslint.config.js
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## 6. Environment Variables

``` env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/solais_db
FRONTEND_URL=http://localhost:5173
JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-a-different-long-random-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
LOG_LEVEL=info
```

Validate configuration with Zod and fail startup when required values
are invalid.

## 7. Foundation Components

Create:

-   `src/config/env.ts` --- Zod environment validation
-   `src/shared/logger/logger.ts` --- Winston JSON logger
-   `src/shared/errors/api-error.ts` --- reusable operational error
-   `src/shared/responses/api-response.ts` --- standard success response
-   `src/middleware/not-found.middleware.ts` --- unknown route handling
-   `src/middleware/error.middleware.ts` --- centralized errors
-   `src/middleware/rate-limit.middleware.ts` --- global API limiter
-   `src/modules/health/health.routes.ts` --- API health endpoint
-   `src/app.ts` --- Express configuration
-   `src/server.ts` --- process entry point and graceful shutdown

## 8. Middleware Order

1.  Helmet
2.  CORS
3.  JSON and URL-encoded body parsers
4.  Cookie parser
5.  Compression
6.  Rate limiter
7.  API routes
8.  Not-found middleware
9.  Global error middleware

## 9. Standard API Contracts

Success:

``` json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

Error:

``` json
{
  "success": false,
  "message": "An error occurred.",
  "errors": []
}
```

## 10. Health Endpoint

``` text
GET /api/v1/health
```

Expected:

``` json
{
  "success": true,
  "message": "Solaís API is healthy.",
  "data": {
    "status": "ok",
    "timestamp": "..."
  }
}
```

Database readiness will be added in IMP-003.

## 11. Testing

Configure Vitest and Supertest. Add a health endpoint test that
verifies:

-   HTTP 200
-   `success` is true
-   `data.status` equals `ok`

## 12. Verification

``` bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run dev
```

Verify:

``` text
http://localhost:5000/api/v1/health
```

## 13. Definition of Done

-   TypeScript strict mode passes
-   ESLint passes
-   Prettier passes
-   Health test passes
-   Server starts
-   Health endpoint returns HTTP 200
-   Unknown routes return HTTP 404
-   Errors follow the standard contract
-   Environment variables are validated
-   Security middleware and rate limiting are active
-   Logs are structured
-   No secrets are committed

## 14. Recommended Commit

``` bash
git add .
git commit -m "chore(backend): establish backend foundation"
```

## 15. Next Document

**IMP-003 --- Database & Prisma Foundation**

It will cover PostgreSQL, Prisma configuration, initial models and
enums, migrations, seed data, database health checks and database
testing.

## Developer Notes

This phase establishes infrastructure only. Authentication, events,
tickets and payments remain separate feature implementations.
Provider-specific dependencies are deliberately deferred until their
requirements are confirmed.
