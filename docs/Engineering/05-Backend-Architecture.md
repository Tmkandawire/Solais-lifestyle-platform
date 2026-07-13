# Engineering Design Document

# 05-Backend-Architecture

  Property      Value
  ------------- ---------------------------
  Document ID   ENG-005
  Version       0.1
  Status        Approved
  Project       Solaís Lifestyle Platform
  Runtime       Node.js
  Framework     Express.js
  Database      PostgreSQL + Prisma ORM

------------------------------------------------------------------------

# 1. Purpose

This document defines the backend architecture of the Solaís Lifestyle
Platform. It establishes the application structure, request lifecycle,
module organization, security model, coding standards and backend
engineering principles.

------------------------------------------------------------------------

# 2. Objectives

-   Domain-driven architecture
-   Secure by design
-   Modular and maintainable
-   Testable business logic
-   Scalable service layer
-   Clear separation of concerns

------------------------------------------------------------------------

# 3. Technology Stack

-   Node.js
-   Express.js
-   PostgreSQL
-   Prisma ORM
-   JWT
-   Zod
-   Cloudinary
-   Resend/Brevo
-   Winston
-   Helmet
-   Express Rate Limit

------------------------------------------------------------------------

# 4. Backend Architecture

The backend follows a Domain-Driven Modular Architecture.

``` text
HTTP Request
    ↓
Express Route
    ↓
Controller
    ↓
Validator (Zod)
    ↓
Service
    ↓
Repository
    ↓
Prisma ORM
    ↓
PostgreSQL
```

------------------------------------------------------------------------

# 5. Folder Structure

``` text
src/
├── config/
├── middleware/
├── shared/
│   ├── errors/
│   ├── logger/
│   ├── utils/
│   └── constants/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── events/
│   ├── tickets/
│   ├── orders/
│   ├── payments/
│   ├── vendors/
│   ├── partners/
│   ├── gallery/
│   ├── journal/
│   ├── notifications/
│   └── analytics/
├── app.ts
└── server.ts
```

Each module contains:

``` text
routes/
controller/
service/
repository/
validators/
dto/
types/
schemas/
utils/
tests/
```

------------------------------------------------------------------------

# 6. Layer Responsibilities

## Routes

-   Register endpoints
-   Apply middleware

## Controllers

-   Receive requests
-   Invoke services
-   Return responses

## Validators

-   Validate input using Zod

## Services

-   Business rules
-   Transactions
-   Cross-module orchestration

## Repositories

-   Database access only
-   Prisma queries
-   Mapping

------------------------------------------------------------------------

# 7. Request Lifecycle

``` text
Client
 ↓
Route
 ↓
Authentication
 ↓
Authorization
 ↓
Validation
 ↓
Controller
 ↓
Service
 ↓
Repository
 ↓
Prisma
 ↓
Database
```

------------------------------------------------------------------------

# 8. Middleware

-   Authentication
-   RBAC
-   Validation
-   Error Handler
-   Rate Limiter
-   Helmet
-   CORS
-   Request Logger

------------------------------------------------------------------------

# 9. Authentication

-   JWT Access Tokens
-   Refresh Tokens
-   Email Verification
-   Password Reset
-   Session Tracking

------------------------------------------------------------------------

# 10. Authorization

RBAC enforced on every protected endpoint.

Roles:

-   Attendee
-   Vendor
-   Partner
-   Support Staff
-   Content Manager
-   Event Manager
-   Administrator
-   Super Administrator

------------------------------------------------------------------------

# 11. Service Integrations

## Payment Service

Provider abstraction for future gateway changes.

## Media Service

Cloudinary upload and management.

## Email Service

Transactional email abstraction.

## QR Service

QR generation and validation.

------------------------------------------------------------------------

# 12. Error Handling

Centralized error middleware.

Standard response:

``` json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

------------------------------------------------------------------------

# 13. Logging

Winston logging for:

-   Requests
-   Errors
-   Authentication
-   Payments
-   Ticket validation
-   Administrative actions

Audit logs stored in the database.

------------------------------------------------------------------------

# 14. Security Standards

-   Helmet
-   Secure cookies
-   JWT
-   Refresh token rotation
-   Password hashing
-   Zod validation
-   SQL injection protection via Prisma
-   Rate limiting
-   CORS

------------------------------------------------------------------------

# 15. File Uploads

Uploads handled through Cloudinary.

Supported assets:

-   Event banners
-   Gallery images
-   User avatars
-   Vendor documents
-   Partner documents

------------------------------------------------------------------------

# 16. Transactions

Database transactions required for:

-   Ticket purchase
-   Payment verification
-   QR generation
-   Vendor approval
-   Partner approval

------------------------------------------------------------------------

# 17. Testing Strategy

-   Unit tests
-   Service tests
-   Repository tests
-   Integration tests
-   API endpoint tests

------------------------------------------------------------------------

# 18. Engineering Rules

1.  No Prisma calls outside repositories.
2.  No business logic in controllers.
3.  Validate before service execution.
4.  Services own business rules.
5.  Modules communicate through services.
6.  Shared utilities belong in shared/.
7.  Every new feature requires documentation before implementation.

------------------------------------------------------------------------

# 19. Developer Notes

The backend architecture is intentionally organized around business
domains instead of technical layers. Each module is independently
maintainable and exposes a clear API to the rest of the system. External
providers are isolated behind service abstractions, allowing
implementation details to change without impacting business logic.

------------------------------------------------------------------------

# Revision History

  Version   Description
  --------- ------------------------------
  0.1       Initial backend architecture
