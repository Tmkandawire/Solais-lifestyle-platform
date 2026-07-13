# Engineering Design Document

# 01-System-Architecture

  Property             Value
  -------------------- ------------------------------------
  Document ID          ENG-001
  Version              0.1
  Status               Approved
  Project              Solaís Lifestyle Platform
  Architecture Style   Domain-Driven Modular Architecture
  Author               Tawanda Mkandawire

------------------------------------------------------------------------

# 1. Purpose

This document defines the software architecture for the Solaís Lifestyle
Platform. It establishes the structural blueprint that all
implementation must follow and serves as the authoritative engineering
reference throughout development.

This document supersedes implementation assumptions. If implementation
conflicts with this document, this document takes precedence until
formally revised.

------------------------------------------------------------------------

# 2. Architectural Goals

-   Scalability
-   Maintainability
-   Security by Design
-   Domain Ownership
-   Loose Coupling
-   High Cohesion
-   Testability
-   Reusable Components
-   AI-Friendly Development
-   Production Readiness

------------------------------------------------------------------------

# 3. Architectural Style

The platform adopts a **Domain-Driven Modular Architecture**.

Business domains own their own routes, controllers, services,
repositories, validation, types and tests.

    Browser
        │
    React Application
        │
    REST API
        │
    Authentication Middleware
        │
    Business Module
        │
    Repository
        │
    Prisma ORM
        │
    PostgreSQL

------------------------------------------------------------------------

# 4. System Domains

    Authentication
    Users
    Events
    Tickets
    Orders
    Payments
    Vendors
    Partners
    Gallery
    Journal
    Notifications
    Analytics
    Administration

Each domain is independently maintainable.

------------------------------------------------------------------------

# 5. High-Level Architecture

                       Visitors
                          │
            Public Website / Dashboards
                          │
                   React + Vite
                          │
                 REST API (Express)
                          │
     ┌──────────────────────────────────────┐
     │ Authentication │ Business Modules    │
     └──────────────────────────────────────┘
                          │
                  Prisma Repository Layer
                          │
                     PostgreSQL Database
                          │
     Cloudinary • Email • Payment Gateway

------------------------------------------------------------------------

# 6. Backend Structure

    src/

    config/
    middleware/
    shared/

    modules/
        auth/
        users/
        events/
        tickets/
        orders/
        payments/
        vendors/
        partners/
        gallery/
        journal/
        notifications/
        analytics/

    app.js
    server.js

Each module contains:

    routes/
    controllers/
    services/
    repositories/
    validators/
    schemas/
    types/
    dto/
    utils/
    tests/

------------------------------------------------------------------------

# 7. Frontend Structure

    src/

    app/
    layouts/
    pages/
    features/
    components/
    hooks/
    services/
    lib/
    types/
    utils/
    assets/

Features mirror backend domains.

------------------------------------------------------------------------

# 8. Request Lifecycle

    Client

    ↓

    Route

    ↓

    Controller

    ↓

    Validator

    ↓

    Service

    ↓

    Repository

    ↓

    Prisma

    ↓

    Database

    ↓

    Repository

    ↓

    Service

    ↓

    Controller

    ↓

    HTTP Response

------------------------------------------------------------------------

# 9. Module Responsibilities

Authentication - Registration - Login - Refresh Tokens - Email
Verification

Events - Event lifecycle - Scheduling - Venue

Tickets - Ticket inventory - QR generation - Validation

Orders - Checkout - Order history

Payments - Provider abstraction - Verification

Community - Vendors - Partners

Content - Gallery - Journal

Administration - Users - Analytics - Settings

------------------------------------------------------------------------

# 10. External Integrations

Cloudinary - Media Storage

Email Provider - Transactional Emails

Payment Provider - Secure Payments

Google Maps - Venue Location

------------------------------------------------------------------------

# 11. Engineering Invariants

1.  No business logic in controllers.
2.  Controllers orchestrate only.
3.  Services contain business rules.
4.  Repositories are the only layer allowed to access Prisma.
5.  Modules never access another module's database objects directly.
6.  Validation occurs before business logic.
7.  Every protected route requires authentication and authorization.
8.  All architectural changes require an ADR.

------------------------------------------------------------------------

# 12. Architecture Decisions

-   ADR-001 PostgreSQL
-   ADR-002 Prisma ORM
-   ADR-003 Radix UI
-   ADR-004 Registration Wizard
-   ADR-005 Payment Abstraction
-   ADR-006 Unified Identity
-   ADR-007 Domain-Driven Architecture
-   ADR-008 Modular Backend

------------------------------------------------------------------------

# 13. Quality Attributes

Performance - Optimized queries - Lazy loading - Image optimization

Security - JWT - RBAC - Zod validation - Audit logs

Maintainability - Modular codebase - Documentation-first - Consistent
standards

Scalability - Provider abstraction - Modular domains - Stateless API

------------------------------------------------------------------------

# 14. Developer Notes

This architecture is intentionally organized around business domains
instead of technical layers. Every implementation must preserve module
boundaries and follow the Engineering Playbook. Features are documented
before implementation and every architectural change must be recorded
through an Architecture Decision Record (ADR).

------------------------------------------------------------------------

# Revision History

  Version   Description
  --------- -------------------------------
  0.1       Initial architecture document
