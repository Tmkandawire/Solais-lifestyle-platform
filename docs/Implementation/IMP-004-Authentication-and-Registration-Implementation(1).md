# Implementation Document

# IMP-004 --- Authentication & Registration Implementation

  Property               Value
  ---------------------- -------------------------------
  Document ID            IMP-004
  Version                1.0
  Status                 Approved for Execution
  Project                Solaís Lifestyle Platform
  Feature                Authentication & Registration
  Source Specification   FS-001
  Phase                  First Business Feature

------------------------------------------------------------------------

# 1. Purpose

This document is the master implementation guide for building
authentication and registration for the Solaís Lifestyle Platform.

It translates FS-001 into an executable sequence covering:

-   Authentication database changes
-   Backend authentication architecture
-   Attendee, Vendor and Partner registration
-   Email verification
-   Login
-   Access and refresh tokens
-   Session rotation and revocation
-   Logout and logout from all devices
-   Forgot-password and reset-password flows
-   Authentication middleware
-   Frontend authentication screens
-   Multi-step registration wizard
-   Integration and security testing

This is the point at which feature coding begins.

------------------------------------------------------------------------

# 2. Implementation Strategy

IMP-004 is divided into seven executable work packages:

``` text
IMP-004
├── IMP-004.1 — Authentication Database Migration
├── IMP-004.2 — Backend Authentication Foundation
├── IMP-004.3 — Registration and Email Verification
├── IMP-004.4 — Login, Tokens and Sessions
├── IMP-004.5 — Password Recovery
├── IMP-004.6 — Frontend Authentication and Registration
└── IMP-004.7 — Integration, Security and Acceptance Testing
```

These are sections of one implementation phase. They may later be
extracted into separate Markdown files if additional detail is required
during coding.

------------------------------------------------------------------------

# 3. Entry Criteria

Before implementation begins, confirm:

-   IMP-001 is completed
-   IMP-002 is completed
-   IMP-003 is completed
-   FS-001 is approved
-   Backend starts successfully
-   PostgreSQL connection succeeds
-   Prisma migrations run successfully
-   Seeded roles exist
-   Health and readiness endpoints return HTTP 200
-   Type checking, linting and tests pass

Do not begin authentication code against an unstable project foundation.

------------------------------------------------------------------------

# 4. IMP-004.1 --- Authentication Database Migration

## Objective

Add the persistence required for email verification and password
recovery.

## Tasks

1.  Add `AuthTokenType` to `prisma/schema.prisma`
2.  Add the `AuthToken` model
3.  Add the `authTokens` relation to `User`
4.  Format the schema
5.  Validate the schema
6.  Generate and review the migration
7.  Apply the migration
8.  Regenerate Prisma Client
9.  Verify tables and indexes in Prisma Studio

## Schema

``` prisma
enum AuthTokenType {
  EMAIL_VERIFICATION
  PASSWORD_RESET
}

model AuthToken {
  id        String        @id @default(uuid()) @db.Uuid
  userId    String        @map("user_id") @db.Uuid
  type      AuthTokenType
  tokenHash String        @unique @map("token_hash") @db.VarChar(255)
  expiresAt DateTime      @map("expires_at")
  usedAt    DateTime?     @map("used_at")
  createdAt DateTime      @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  @@index([userId, type])
  @@index([expiresAt])
  @@map("auth_tokens")
}
```

Add to `User`:

``` prisma
authTokens AuthToken[]
```

## Commands

``` bash
npm run prisma:format
npm run prisma:validate
npx prisma migrate dev --name add_auth_tokens
npm run prisma:generate
```

## Verification

-   `auth_tokens` exists
-   Foreign key points to `users`
-   Token hash is unique
-   Required indexes exist
-   Migration SQL is reviewed

## Commit

``` bash
git add .
git commit -m "feat(auth): add authentication token persistence"
```

------------------------------------------------------------------------

# 5. IMP-004.2 --- Backend Authentication Foundation

## Objective

Create the authentication module and shared security utilities without
implementing all endpoint behavior at once.

## Module Structure

``` text
src/modules/auth/
├── auth.constants.ts
├── auth.controller.ts
├── auth.dto.ts
├── auth.repository.ts
├── auth.routes.ts
├── auth.schemas.ts
├── auth.service.ts
├── auth.types.ts
├── auth.utils.ts
└── tests/
    ├── auth.service.test.ts
    └── auth.integration.test.ts
```

Shared components:

``` text
src/shared/
├── crypto/
│   ├── password.ts
│   └── secure-token.ts
├── email/
│   ├── email.service.ts
│   ├── email.types.ts
│   └── templates/
└── tokens/
    ├── jwt.service.ts
    └── token.types.ts
```

Middleware:

``` text
src/middleware/
├── authenticate.middleware.ts
├── authorize.middleware.ts
└── validate.middleware.ts
```

## Responsibilities

  File                   Responsibility
  ---------------------- ---------------------------------------
  `auth.routes.ts`       Routes and middleware composition
  `auth.controller.ts`   HTTP request and response translation
  `auth.service.ts`      Authentication business rules
  `auth.repository.ts`   Prisma database access
  `auth.schemas.ts`      Zod request validation
  `auth.dto.ts`          Safe response mapping
  `auth.constants.ts`    Expiry values and safe constants
  `auth.types.ts`        Authentication-specific types
  `password.ts`          Hashing and password comparison
  `secure-token.ts`      Random token generation and hashing
  `jwt.service.ts`       JWT signing and verification
  `email.service.ts`     Provider-independent email contract

## Rules

-   Routes do not contain business logic
-   Controllers do not query Prisma
-   Services do not construct raw HTTP responses
-   Repositories own Prisma queries
-   DTOs exclude password and token hashes
-   Provider-specific email code stays behind an interface

## Commit

``` bash
git add .
git commit -m "feat(auth): establish authentication module foundation"
```

------------------------------------------------------------------------

# 6. IMP-004.3 --- Registration and Email Verification

## Objective

Implement Attendee, Vendor and Partner registration and email
verification.

## Backend Tasks

1.  Create discriminated Zod registration schemas
2.  Normalize email addresses
3.  Validate password policy
4.  Confirm password equality
5.  Restrict public roles
6.  Check duplicate email
7.  Hash password
8.  Resolve the seeded role
9.  Create User and role-specific profile in one transaction
10. Generate verification token
11. Store only the token hash
12. Send verification email after commit
13. Implement verification
14. Implement verification resend
15. Add registration rate limiting
16. Add audit hooks

## Registration Transaction

``` text
BEGIN
  Create User
  Create correct role profile
  Create verification token record
COMMIT
  Send verification email
```

If email delivery fails:

-   Keep the account pending
-   Log the delivery failure safely
-   Allow resend
-   Do not roll back the valid account

## Endpoints

``` text
POST /api/v1/auth/register
POST /api/v1/auth/verify-email
POST /api/v1/auth/resend-verification
```

## Required Tests

-   Attendee registration
-   Vendor registration
-   Partner registration
-   Invalid role
-   Duplicate email
-   Email case normalization
-   Weak password
-   Mismatched passwords
-   Transaction rollback
-   Valid verification
-   Expired token
-   Used token
-   Resend behavior
-   Rate limiting

## Commit

``` bash
git add .
git commit -m "feat(auth): implement registration and email verification"
```

------------------------------------------------------------------------

# 7. IMP-004.4 --- Login, Tokens and Sessions

## Objective

Implement secure authentication sessions with short-lived access tokens
and rotating refresh tokens.

## Backend Tasks

1.  Implement login schema
2.  Verify credentials
3.  Check email verification
4.  Enforce account status
5.  Generate access token
6.  Generate refresh token
7.  Store refresh-token hash in `Session`
8.  Set secure HTTP-only cookie
9.  Implement access-token middleware
10. Implement authorization middleware
11. Implement `/me`
12. Implement refresh rotation
13. Detect invalid or reused refresh tokens
14. Implement current-session logout
15. Implement logout from all devices
16. Add audit hooks

## Endpoints

``` text
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/logout-all
GET  /api/v1/auth/me
```

## Security Rules

-   Access token: approximately 15 minutes
-   Refresh token: approximately 7 days
-   Raw refresh token exists only in the cookie and during processing
-   Database stores only its hash
-   Refresh token rotates on every successful refresh
-   Logout revokes the session
-   Logout-all revokes every active user session
-   Tokens are never stored in browser local storage

## Required Tests

-   Valid login
-   Invalid email
-   Invalid password
-   Pending verification
-   Suspended account
-   Disabled account
-   Session creation
-   Access-token validation
-   Refresh rotation
-   Expired session
-   Revoked session
-   Logout
-   Logout-all
-   Safe `/me` response

## Commit

``` bash
git add .
git commit -m "feat(auth): implement login and secure session rotation"
```

------------------------------------------------------------------------

# 8. IMP-004.5 --- Password Recovery

## Objective

Implement secure forgot-password and reset-password flows.

## Backend Tasks

1.  Validate recovery email
2.  Return neutral response
3.  Generate secure reset token
4.  Store only token hash
5.  Set approximately 30-minute expiry
6.  Send password-reset email
7.  Validate reset token
8.  Enforce password policy
9.  Hash new password
10. Mark reset token as used
11. Revoke all sessions
12. Send password-changed notification
13. Add audit hooks
14. Apply strict rate limiting

## Endpoints

``` text
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

## Required Tests

-   Existing email
-   Unknown email with same neutral response
-   Expired token
-   Invalid token
-   Used token
-   Weak new password
-   Successful reset
-   Session revocation
-   Password-change notification

## Commit

``` bash
git add .
git commit -m "feat(auth): implement secure password recovery"
```

------------------------------------------------------------------------

# 9. IMP-004.6 --- Frontend Authentication and Registration

## Objective

Build the user-facing authentication experience using React, TypeScript,
Tailwind CSS and Radix UI primitives.

## Feature Structure

``` text
src/features/auth/
├── api/
│   └── auth.api.ts
├── components/
│   ├── AccountTypeSelector.tsx
│   ├── AuthCard.tsx
│   ├── PasswordField.tsx
│   ├── PasswordRequirements.tsx
│   ├── RegistrationProgress.tsx
│   └── RegistrationReview.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useRegistrationWizard.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── VerifyEmailPage.tsx
│   ├── ForgotPasswordPage.tsx
│   └── ResetPasswordPage.tsx
├── schemas/
│   └── auth.schemas.ts
├── types/
│   └── auth.types.ts
└── utils/
```

## Registration Wizard

``` text
Step 1 — Account Type
Step 2 — Account Details
Step 3 — Role Details
Step 4 — Consent and Preferences
Step 5 — Review and Submit
Step 6 — Check Your Email
```

## Frontend Tasks

1.  Configure authentication API client
2.  Configure credentialed refresh requests
3.  Build account-type cards
4.  Build shared account fields
5.  Build Attendee fields
6.  Build Vendor fields
7.  Build Partner fields
8.  Build consent step
9.  Build review step
10. Build success state
11. Build email verification screen
12. Build login screen
13. Build forgot-password screen
14. Build reset-password screen
15. Add protected routes
16. Add role-aware redirects
17. Add light and dark themes
18. Add loading and error states
19. Verify responsive behavior
20. Verify keyboard and screen-reader behavior

## State Rules

-   Use React Hook Form for form state
-   Use Zod for client validation
-   Server remains authoritative
-   Do not persist passwords
-   Do not place tokens in local storage
-   Prevent duplicate submission
-   Preserve wizard values during normal step navigation

## Commit

``` bash
git add .
git commit -m "feat(auth): build authentication and registration experience"
```

------------------------------------------------------------------------

# 10. IMP-004.7 --- Integration, Security and Acceptance Testing

## Objective

Verify the complete authentication feature across database, backend,
email and frontend layers.

## Test Categories

### Unit

-   Password policy
-   Hash and comparison
-   Token generation
-   Token hashing
-   Email normalization
-   DTO sanitization
-   Role routing

### Integration

-   All authentication endpoints
-   Database transactions
-   Cookies
-   Sessions
-   Email-service test adapter
-   Validation
-   Rate limits

### End-to-End

-   Attendee registration to login
-   Vendor registration to login
-   Partner registration to login
-   Verification resend
-   Password reset
-   Logout
-   Logout-all
-   Protected route behavior

### Security

-   Enumeration resistance
-   Credential leakage
-   Token leakage
-   Refresh rotation
-   Revoked-session access
-   Invalid role injection
-   Mass assignment
-   Repeated submission
-   Rate-limit behavior

### Accessibility

-   Keyboard-only wizard
-   Error announcements
-   Focus management
-   Visible focus
-   Labels
-   Contrast in light and dark themes

## Final Commands

``` bash
npm run typecheck
npm run lint
npm run format:check
npm test
npm run build
```

## Final Acceptance

All FS-001 acceptance criteria must pass before authentication is marked
complete.

## Commit

``` bash
git add .
git commit -m "test(auth): complete authentication acceptance testing"
```

------------------------------------------------------------------------

# 11. Environment Variables

Add placeholders as integrations are implemented:

``` env
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

EMAIL_PROVIDER=
EMAIL_FROM=
EMAIL_FROM_NAME=Solaís Lifestyle

FRONTEND_URL=http://localhost:5173
```

Provider-specific values must remain behind the email abstraction and
must never be committed.

------------------------------------------------------------------------

# 12. Recommended Coding Order

``` text
Day 1
IMP-004.1 — Database Migration
IMP-004.2 — Backend Foundation

Day 2
IMP-004.3 — Registration Service
Registration Tests

Day 3
Email Verification
Resend Verification
Verification Tests

Day 4
IMP-004.4 — Login and Sessions

Day 5
Refresh Rotation
Logout
Authentication Middleware

Day 6
IMP-004.5 — Password Recovery

Day 7–8
IMP-004.6 — Frontend Authentication

Day 9
Frontend and Backend Integration

Day 10
IMP-004.7 — Security and Acceptance Testing
```

This is a planning estimate, not a promise. Complete and verify each
work package before moving forward.

------------------------------------------------------------------------

# 13. Definition of Done

IMP-004 is complete when:

-   AuthToken migration is applied
-   Three public registration paths work
-   Registration is transactional
-   Verification email flow works
-   Resend verification works
-   Active verified users can log in
-   Access tokens work
-   Refresh rotation works
-   Sessions are stored securely
-   Logout works
-   Logout-all works
-   Forgot-password works
-   Reset-password works
-   Existing sessions are revoked after reset
-   `/me` returns a safe user DTO
-   Registration wizard is responsive
-   Light and dark themes work
-   Authentication screens are accessible
-   Unit, integration and acceptance tests pass
-   No password or token secrets appear in logs or responses
-   FS-001 acceptance criteria pass

------------------------------------------------------------------------

# 14. Next Feature After IMP-004

After authentication is implemented and tested:

``` text
FS-002 — Event Management Specification
                ↓
IMP-005 — Event Management Implementation
                ↓
FS-003 — Ticketing and Checkout Specification
                ↓
IMP-006 — Ticketing and Checkout Implementation
```

Payment-provider implementation remains dependent on the client's
confirmed Zambian payment process.

------------------------------------------------------------------------

# 15. Current Project Position

``` text
PHASE 1 — BUSINESS REQUIREMENTS
Chapter 1 — Introduction                         COMPLETE
Chapter 2 — Business Analysis                    COMPLETE
Chapter 3 — System Overview                      COMPLETE
Chapter 4 — Stakeholder Analysis                 COMPLETE
Chapter 5 — RBAC                                 COMPLETE
Chapter 6 — Functional Requirements              COMPLETE

PHASE 2 — ENGINEERING DESIGN
ENG-001 — System Architecture                    COMPLETE
ENG-002 — Database Design                        COMPLETE
ENG-003 — API Specification                      COMPLETE
ENG-004 — Frontend Architecture                  COMPLETE
ENG-005 — Backend Architecture                   COMPLETE
ENG-006 — UI Design System                       COMPLETE
ENG-007 — Security Architecture                  COMPLETE
ENG-008 — Deployment Architecture                COMPLETE
ENG-009 — Engineering Playbook                   COMPLETE

PHASE 3 — IMPLEMENTATION PLANNING
00 — Implementation Roadmap                      COMPLETE
IMP-001 — Project Setup                          COMPLETE
IMP-002 — Backend Foundation                     COMPLETE
IMP-003 — Database & Prisma Foundation           COMPLETE
FS-001 — Authentication & Registration           COMPLETE
IMP-004 — Authentication & Registration          CURRENT DOCUMENT

PHASE 4 — CODING
Execute IMP-001                                  NEXT
Execute IMP-002
Execute IMP-003
Execute IMP-004.1 through IMP-004.7

PHASE 5 — REMAINING MVP FEATURES
Event Management
Ticketing and Checkout
Payments
Attendee Dashboard
Vendor and Partner Workflows
Admin Dashboard
Gallery
Lifestyle Journal
Contact and Newsletter
Testing, Deployment and Launch
```

------------------------------------------------------------------------

# 16. Planning Gate

The project has enough documentation to begin coding.

Do not create every remaining feature specification before
implementation. That would delay the MVP and risk documenting
assumptions too far in advance.

The next action after approving this document is:

> Open VS Code and execute IMP-001 --- Project Setup.

Then execute IMP-002 and IMP-003. Once the foundation is running and
verified, begin IMP-004.1.

Planning continues just ahead of implementation:

``` text
Specify one feature
        ↓
Implement it
        ↓
Test it
        ↓
Commit it
        ↓
Specify the next feature
```

This preserves engineering discipline without delaying delivery.

------------------------------------------------------------------------

# Revision History

  Version   Description
  --------- ------------------------------------------------------------
  1.0       Initial Authentication & Registration implementation guide
