# Feature Specification

# FS-001 --- Authentication & Registration

  Property         Value
  ---------------- --------------------------------
  Document ID      FS-001
  Version          1.0
  Status           Approved for Implementation
  Project          Solaís Lifestyle Platform
  Feature Domain   Identity and Access Management
  MVP Priority     Critical

------------------------------------------------------------------------

# 1. Purpose

This document defines the complete functional and technical
specification for authentication, account registration, email
verification, session management and account recovery in the Solaís
Lifestyle Platform.

The feature supports three public registration paths:

-   Attendee
-   Vendor
-   Partner

The specification is the source of truth for IMP-004 --- Authentication
& Registration Implementation.

------------------------------------------------------------------------

# 2. Business Objective

The authentication system must provide a secure, elegant and
low-friction entry point into the Solaís community while collecting only
the information required for each user type.

The feature must:

-   Allow users to choose how they are joining Solaís
-   Create one secure identity per email address
-   Support role-specific onboarding
-   Verify email ownership
-   Protect accounts and sessions
-   Separate account activation from vendor or partner approval
-   Provide secure account recovery
-   Give administrators visibility into registrations without exposing
    credentials

------------------------------------------------------------------------

# 3. MVP Scope

Included:

-   Registration-type selection
-   Attendee registration
-   Vendor registration
-   Partner registration
-   Multi-step registration wizard
-   Email and password authentication
-   Email verification
-   Login
-   Access-token issuance
-   Refresh-token rotation
-   Logout
-   Logout from all devices
-   Forgot password
-   Reset password
-   Current-user endpoint
-   Session persistence and revocation
-   Role-aware post-login routing
-   Validation and security controls
-   Transactional authentication emails

Excluded from MVP:

-   Google, Apple or Facebook sign-in
-   Passwordless login
-   Multi-factor authentication
-   Biometric authentication
-   Organization teams
-   Multiple simultaneous primary roles
-   Self-service role switching
-   Public vendor or partner approval
-   Advanced device-management UI

------------------------------------------------------------------------

# 4. Actors

  -----------------------------------------------------------------------
  Actor                               Description
  ----------------------------------- -----------------------------------
  Guest                               Unauthenticated visitor

  Attendee                            User who discovers events,
                                      purchases tickets and manages
                                      attendance

  Vendor                              Business representative who may
                                      apply to participate in events

  Partner                             Organization representative
                                      interested in sponsorship or
                                      collaboration

  Administrator                       Authorized operational user

  Super Administrator                 Highest-privilege platform
                                      administrator

  System                              Backend services responsible for
                                      tokens, email and auditing
  -----------------------------------------------------------------------

Administrative roles are not available through public registration.

------------------------------------------------------------------------

# 5. Core Business Rules

1.  An email address may belong to only one user account.
2.  Email addresses are trimmed and normalized to lowercase.
3.  Public users may register only as Attendee, Vendor or Partner.
4.  A user has one primary role in the MVP.
5.  Passwords are never stored in plaintext.
6.  Email ownership must be verified before the account becomes fully
    active.
7.  Vendor or partner account activation does not equal application
    approval.
8.  Vendor and partner application status is managed separately.
9.  Authentication errors must not reveal whether an email exists where
    enumeration is a risk.
10. Refresh tokens are stored only as cryptographic hashes.
11. Logout revokes the current session.
12. Password reset revokes existing sessions.
13. Disabled or suspended users cannot create new authenticated
    sessions.
14. Administrative roles are assigned only through authorized
    administrative processes.

------------------------------------------------------------------------

# 6. Registration Wizard Overview

``` text
Welcome
   ↓
Choose Account Type
   ↓
Shared Account Details
   ↓
Role-Specific Details
   ↓
Preferences and Consent
   ↓
Review
   ↓
Submit
   ↓
Verification Email
   ↓
Verify Email
   ↓
Account Activated
```

The wizard must:

-   Show progress
-   Preserve entered data while moving between steps
-   Validate the current step before continuing
-   Allow users to return to completed steps
-   Prevent duplicate submissions
-   Be responsive and keyboard accessible
-   Display clear loading, success and error states

------------------------------------------------------------------------

# 7. Step 1 --- Choose Account Type

Options:

## Attendee

Description:

> Join the Solaís community, discover experiences, purchase tickets and
> manage your attendance.

## Vendor

Description:

> Create a business profile and apply to showcase your products or
> services at Solaís experiences.

## Partner

Description:

> Represent an organization interested in sponsorship, brand activation
> or strategic collaboration.

Required field:

``` text
accountType
```

Allowed values:

``` text
ATTENDEE
VENDOR
PARTNER
```

The selected type determines the role-specific wizard fields and initial
dashboard destination.

------------------------------------------------------------------------

# 8. Step 2 --- Shared Account Details

Fields:

  Field                Required Validation
  ------------------ ---------- -------------------------------------
  First name                Yes 2--100 characters
  Last name                 Yes 2--100 characters
  Email address             Yes Valid email; maximum 255 characters
  Phone number              Yes Valid international format
  Password                  Yes Password policy
  Confirm password          Yes Must match password

Password policy:

-   Minimum 12 characters
-   At least one uppercase letter
-   At least one lowercase letter
-   At least one number
-   At least one special character
-   Must not contain the full email address
-   Must not contain obvious whitespace-only padding

The UI should provide:

-   Show/hide password
-   Password requirement indicators
-   Password-match feedback
-   Accessible field descriptions

------------------------------------------------------------------------

# 9. Step 3A --- Attendee Details

Fields:

  Field                 Required Notes
  ------------------- ---------- --------------------------------------------
  Interests                   No Multi-select lifestyle and event interests
  Newsletter opt-in           No Explicit consent; unchecked by default

Initial interest options may include:

-   Networking
-   Business
-   Entrepreneurship
-   Fashion
-   Culture
-   Food and lifestyle
-   Live entertainment
-   Creative experiences

Interests are preferences, not authorization attributes.

------------------------------------------------------------------------

# 10. Step 3B --- Vendor Details

Fields:

  ------------------------------------------------------------------------
  Field                                     Required Validation
  --------------------- ---------------------------- ---------------------
  Business name                                  Yes 2--200 characters

  Business category                              Yes Approved category

  Products or services                           Yes 20--2,000 characters

  Website                                         No Valid HTTPS URL

  Social-media URL                                No Valid URL

  Preferred event              No in initial release Enabled after Event
                                                     integration
  ------------------------------------------------------------------------

Initial categories:

-   Fashion and Beauty
-   Food and Beverages
-   Health and Wellness
-   Art and Crafts
-   Technology
-   Financial Services
-   Real Estate
-   Automotive
-   Lifestyle Brands
-   Other

Initial profile status:

``` text
DRAFT
```

Registration creates the account and vendor profile. It does not
automatically submit or approve participation in an event.

------------------------------------------------------------------------

# 11. Step 3C --- Partner Details

Fields:

  Field                    Required Validation
  ---------------------- ---------- ------------------------
  Organization name             Yes 2--200 characters
  Industry                       No Maximum 150 characters
  Website                        No Valid HTTPS URL
  Partnership interest          Yes 20--2,000 characters

Partnership interests may include:

-   Sponsorship
-   Brand activation
-   Strategic partnership
-   Media partnership
-   Corporate collaboration
-   Other

Initial profile status:

``` text
DRAFT
```

Registration creates the account and partner profile. It does not
indicate that a partnership has been approved.

------------------------------------------------------------------------

# 12. Step 4 --- Consent and Preferences

Required:

-   Accept Terms of Service
-   Accept Privacy Policy

Optional:

-   Receive event announcements
-   Receive early ticket access
-   Receive special invitations
-   Receive exclusive updates

Consent rules:

-   Required legal consent cannot be preselected
-   Marketing consent cannot be preselected
-   Consent wording must be clear
-   Consent timestamp and policy version should be retained when the
    legal documents are finalized

For the first implementation, newsletter consent is persisted on the
attendee profile where applicable. A generalized consent record may be
introduced later.

------------------------------------------------------------------------

# 13. Step 5 --- Review and Submit

Display:

-   Account type
-   Personal information
-   Role-specific information
-   Preferences
-   Consent selections

Do not display the password.

Actions:

-   Edit a previous section
-   Submit registration

Submission behavior:

1.  Disable repeated submission
2.  Validate the complete payload
3.  Create all required records in one database transaction
4.  Generate an email-verification token
5.  Send a verification email
6.  Show a neutral success screen

Success message:

> Your Solaís account has been created. Please check your email to
> verify your account.

------------------------------------------------------------------------

# 14. Registration Persistence

The registration service must use one database transaction.

Attendee:

``` text
User
 ↓
AttendeeProfile
 ↓
Verification Token
```

Vendor:

``` text
User
 ↓
VendorProfile
 ↓
Verification Token
```

Partner:

``` text
User
 ↓
PartnerProfile
 ↓
Verification Token
```

If any required database operation fails, the transaction must roll
back.

Email delivery occurs after the database transaction. If email delivery
fails, the account remains pending and the user may request another
verification email.

------------------------------------------------------------------------

# 15. Account Status Lifecycle

``` text
PENDING_VERIFICATION
          ↓
        ACTIVE
          ↓
   ┌──────┴──────┐
SUSPENDED      DISABLED
```

Rules:

-   New public accounts begin as `PENDING_VERIFICATION`
-   Successful email verification changes the account to `ACTIVE`
-   `SUSPENDED` blocks authentication temporarily
-   `DISABLED` blocks authentication until administrative action
-   Status changes must be audited

------------------------------------------------------------------------

# 16. Email Verification

After registration:

1.  Generate a cryptographically secure random token
2.  Store only its hash
3.  Associate it with the user
4.  Set an expiry
5.  Email the raw token in a verification link
6.  Mark the token as consumed after successful verification

Recommended expiry:

``` text
24 hours
```

Verification link:

``` text
{FRONTEND_URL}/verify-email?token={rawToken}
```

Success behavior:

-   Mark `emailVerifiedAt`
-   Change status to `ACTIVE`
-   Mark token as used
-   Write an audit event
-   Redirect to a success screen
-   Allow the user to continue to login

Failure states:

-   Missing token
-   Invalid token
-   Expired token
-   Already-used token
-   Already-verified account

------------------------------------------------------------------------

# 17. Resend Verification Email

Endpoint behavior:

-   Accept an email address
-   Return a neutral response regardless of account existence
-   If an eligible pending account exists, invalidate prior unused
    verification tokens
-   Generate and send a new token
-   Apply strict rate limiting

Neutral response:

> If an eligible account exists, a new verification email has been sent.

------------------------------------------------------------------------

# 18. Login

Fields:

  Field           Required
  ------------- ----------
  Email                Yes
  Password             Yes
  Remember me           No

Flow:

``` text
Submit Credentials
        ↓
Validate Input
        ↓
Find User
        ↓
Verify Password
        ↓
Check Account Status
        ↓
Create Session
        ↓
Issue Access Token
        ↓
Set Refresh Cookie
        ↓
Return Safe User
```

Successful response includes:

-   Access token
-   Safe user summary
-   Role
-   Role-specific dashboard destination

The refresh token is sent in an HTTP-only cookie and is not returned in
the JSON body.

------------------------------------------------------------------------

# 19. Login Failure Behavior

Use a generic message for invalid credentials:

> The email address or password is incorrect.

Do not reveal whether:

-   The email exists
-   The password alone is wrong

Specific account-state messages may be shown only after credentials are
verified:

-   Email verification required
-   Account suspended
-   Account disabled

Apply a stricter authentication rate limiter than the global API
limiter.

------------------------------------------------------------------------

# 20. Token Strategy

Access token:

-   Short-lived
-   Recommended lifetime: 15 minutes
-   Returned in the response body
-   Held in application memory
-   Sent through the `Authorization` header

Refresh token:

-   Long-lived
-   Recommended lifetime: 7 days
-   Stored in a secure HTTP-only cookie
-   Rotated whenever refreshed
-   Stored in the database only as a hash
-   Bound to a session record

Do not store access or refresh tokens in `localStorage`.

------------------------------------------------------------------------

# 21. Access-Token Claims

Minimum claims:

``` json
{
  "sub": "user-uuid",
  "role": "ATTENDEE",
  "sessionId": "session-uuid",
  "type": "access"
}
```

Do not place sensitive profile information in tokens.

Authorization must use server-validated identity and permissions. A
token claim alone must not override current account status or
revoked-session rules where a database check is required.

------------------------------------------------------------------------

# 22. Refresh-Token Rotation

Flow:

1.  Read refresh token from secure cookie
2.  Hash the presented token
3.  Find the active session
4.  Verify expiry and revocation state
5.  Verify the user is allowed to authenticate
6.  Generate a new refresh token
7.  Replace the stored hash
8.  Update `lastUsedAt`
9.  Set the new cookie
10. Return a new access token

Reuse handling:

-   If an already-rotated or invalidated refresh token is detected,
    revoke the affected session
-   Record a security event
-   Require the user to log in again

------------------------------------------------------------------------

# 23. Refresh Cookie Configuration

Production:

``` text
httpOnly: true
secure: true
sameSite: appropriate to deployment topology
path: /api/v1/auth
```

Development may use `secure: false` only over local HTTP.

Cookie settings must be reviewed when the final frontend and API domains
are confirmed.

------------------------------------------------------------------------

# 24. Current User

Endpoint:

``` text
GET /api/v1/auth/me
```

Returns:

-   User ID
-   First name
-   Last name
-   Email
-   Phone
-   Avatar URL
-   Account status
-   Email verification state
-   Role
-   Role-specific profile summary

Never returns:

-   Password hash
-   Token hashes
-   Internal security metadata

------------------------------------------------------------------------

# 25. Logout

Endpoint:

``` text
POST /api/v1/auth/logout
```

Behavior:

-   Revoke the current session
-   Clear the refresh-token cookie
-   Return success even when the cookie is already absent

------------------------------------------------------------------------

# 26. Logout From All Devices

Endpoint:

``` text
POST /api/v1/auth/logout-all
```

Requirements:

-   Valid access token
-   Revoke all active sessions belonging to the current user
-   Clear the current refresh cookie
-   Write an audit event

------------------------------------------------------------------------

# 27. Forgot Password

Field:

``` text
email
```

Behavior:

1.  Validate email
2.  Return a neutral response
3.  If an eligible account exists, generate a secure reset token
4.  Store only its hash
5.  Set an expiry
6.  Send the reset link
7.  Rate-limit requests

Neutral response:

> If an account exists for that email address, password-reset
> instructions have been sent.

Recommended expiry:

``` text
30 minutes
```

------------------------------------------------------------------------

# 28. Reset Password

Fields:

  Field                    Required
  ---------------------- ----------
  Token                         Yes
  New password                  Yes
  Confirm new password          Yes

Behavior:

1.  Validate token
2.  Verify token is unused and unexpired
3.  Validate password policy
4.  Hash the new password
5.  Update the user
6.  Mark the reset token as used
7.  Revoke all active sessions
8.  Write an audit event
9.  Send a password-changed notification
10. Require a new login

------------------------------------------------------------------------

# 29. Required Database Additions

IMP-003 created identity and session models. Authentication
implementation also requires a one-time token model.

Recommended:

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

The migration belongs to IMP-004 because it is feature-specific.

------------------------------------------------------------------------

# 30. API Endpoints

  ------------------------------------------------------------------------------------------
  Method            Endpoint                             Authentication    Purpose
  ----------------- ------------------------------------ ----------------- -----------------
  POST              `/api/v1/auth/register`              Public            Register
                                                                           attendee, vendor
                                                                           or partner

  POST              `/api/v1/auth/verify-email`          Public            Verify email
                                                                           token

  POST              `/api/v1/auth/resend-verification`   Public            Request another
                                                                           verification
                                                                           email

  POST              `/api/v1/auth/login`                 Public            Authenticate user

  POST              `/api/v1/auth/refresh`               Refresh cookie    Rotate refresh
                                                                           token

  POST              `/api/v1/auth/logout`                Refresh cookie    Revoke current
                                                                           session

  POST              `/api/v1/auth/logout-all`            Access token      Revoke all user
                                                                           sessions

  POST              `/api/v1/auth/forgot-password`       Public            Request password
                                                                           reset

  POST              `/api/v1/auth/reset-password`        Public            Set a new
                                                                           password

  GET               `/api/v1/auth/me`                    Access token      Return current
                                                                           user
  ------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 31. Registration Request

``` json
{
  "accountType": "ATTENDEE",
  "firstName": "Tawanda",
  "lastName": "Mkandawire",
  "email": "user@example.com",
  "phone": "+260XXXXXXXXX",
  "password": "StrongPassword!2026",
  "confirmPassword": "StrongPassword!2026",
  "attendee": {
    "interests": ["BUSINESS", "NETWORKING"],
    "newsletterOptIn": true
  },
  "consents": {
    "termsAccepted": true,
    "privacyAccepted": true
  }
}
```

Only the object matching `accountType` is accepted.

Vendor payloads use `vendor`; partner payloads use `partner`.

------------------------------------------------------------------------

# 32. Registration Success Response

Status:

``` text
201 Created
```

``` json
{
  "success": true,
  "message": "Your account has been created. Please check your email to verify your account.",
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "accountType": "ATTENDEE",
    "status": "PENDING_VERIFICATION",
    "verificationRequired": true
  }
}
```

Do not automatically log the user in before verification.

------------------------------------------------------------------------

# 33. Login Success Response

Status:

``` text
200 OK
```

``` json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "accessToken": "jwt",
    "user": {
      "id": "uuid",
      "firstName": "Tawanda",
      "lastName": "Mkandawire",
      "email": "user@example.com",
      "role": "ATTENDEE",
      "status": "ACTIVE"
    },
    "redirectTo": "/dashboard"
  }
}
```

------------------------------------------------------------------------

# 34. Standard Error Contract

``` json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    {
      "field": "email",
      "message": "Enter a valid email address."
    }
  ]
}
```

Production errors must not expose:

-   Stack traces
-   SQL details
-   Prisma internals
-   Token values
-   Password data

------------------------------------------------------------------------

# 35. HTTP Status Codes

    Status Use
  -------- -------------------------------------------------------------
       200 Successful login, verification, refresh or recovery request
       201 Registration created
       400 Malformed or invalid token request
       401 Invalid credentials or unauthenticated request
       403 Verified credentials but account state blocks access
       404 Protected resource not found
       409 Duplicate email during registration
       422 Validation failure
       429 Rate limit exceeded
       500 Unexpected server error

------------------------------------------------------------------------

# 36. Backend Module Structure

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

Supporting services:

``` text
src/shared/
├── crypto/
├── email/
└── tokens/
```

Responsibilities:

-   Routes: endpoint registration and middleware
-   Controller: HTTP translation only
-   Schemas: Zod request validation
-   Service: authentication business rules and transactions
-   Repository: Prisma access only
-   DTO: safe output mapping
-   Utilities: focused authentication helpers

------------------------------------------------------------------------

# 37. Frontend Feature Structure

``` text
src/features/auth/
├── api/
├── components/
│   ├── AccountTypeSelector.tsx
│   ├── PasswordRequirements.tsx
│   ├── RegistrationProgress.tsx
│   └── RegistrationReview.tsx
├── hooks/
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── VerifyEmailPage.tsx
│   ├── ForgotPasswordPage.tsx
│   └── ResetPasswordPage.tsx
├── schemas/
├── types/
└── utils/
```

The final structure may be refined during frontend implementation while
preserving feature ownership.

------------------------------------------------------------------------

# 38. Frontend Routes

``` text
/login
/register
/verify-email
/forgot-password
/reset-password
```

Authenticated redirects:

  Role                  Default Destination
  --------------------- ----------------------
  Attendee              `/dashboard`
  Vendor                `/vendor/dashboard`
  Partner               `/partner/dashboard`
  Administrator         `/admin`
  Super Administrator   `/admin`

------------------------------------------------------------------------

# 39. UI States

Every authentication screen must define:

-   Initial
-   Focused
-   Validation error
-   Submitting
-   Success
-   API error
-   Rate-limited
-   Offline or network failure

The registration wizard must also support:

-   Step complete
-   Step incomplete
-   Back navigation
-   Submission locked while processing

------------------------------------------------------------------------

# 40. Accessibility Requirements

-   Semantic labels
-   Keyboard navigation
-   Visible focus indicators
-   Error messages associated with fields
-   Progress indicator with accessible step information
-   No color-only validation
-   Password controls with accessible names
-   Sufficient light- and dark-theme contrast
-   Focus moves to the error summary after failed submission

Target:

``` text
WCAG 2.2 AA
```

------------------------------------------------------------------------

# 41. Security Requirements

-   Hash passwords using the approved adaptive password-hashing
    algorithm
-   Use cryptographically secure random tokens
-   Hash verification, reset and refresh tokens before storage
-   Rotate refresh tokens
-   Apply login and recovery rate limits
-   Use secure HTTP-only cookies
-   Validate every request with Zod
-   Use generic recovery responses
-   Prevent mass assignment
-   Exclude credential fields from DTOs
-   Audit security-sensitive events
-   Do not log secrets
-   Revoke sessions after password reset
-   Enforce account status during authentication

------------------------------------------------------------------------

# 42. Audit Events

Record:

-   `USER_REGISTERED`
-   `EMAIL_VERIFIED`
-   `VERIFICATION_EMAIL_REQUESTED`
-   `LOGIN_SUCCEEDED`
-   `LOGIN_FAILED`
-   `SESSION_REFRESHED`
-   `SESSION_REVOKED`
-   `ALL_SESSIONS_REVOKED`
-   `PASSWORD_RESET_REQUESTED`
-   `PASSWORD_RESET_COMPLETED`
-   `ACCOUNT_SUSPENDED`
-   `ACCOUNT_DISABLED`

The detailed AuditLog implementation may be introduced with the
administration foundation, but the authentication service should expose
audit hooks from the beginning.

------------------------------------------------------------------------

# 43. Transactional Emails

Required templates:

1.  Verify your Solaís account
2.  Password reset request
3.  Password changed successfully

Email requirements:

-   Solaís branding
-   Clear subject
-   One primary action
-   Expiry information
-   Plain-text fallback
-   Support contact
-   No password or sensitive data

Provider selection remains configurable behind an email-service
abstraction.

------------------------------------------------------------------------

# 44. Rate-Limiting Baseline

Suggested starting limits:

  Action                Baseline
  --------------------- ---------------------------------------------------
  Registration          5 requests per hour per IP
  Login                 5 failed attempts per 15 minutes per IP/email key
  Resend verification   3 requests per hour
  Forgot password       3 requests per hour
  Refresh               30 requests per 15 minutes per session

These are initial operational values and may be tuned after observing
legitimate usage.

------------------------------------------------------------------------

# 45. Edge Cases

The implementation must handle:

-   Duplicate email with different letter casing
-   Double-click registration
-   Verification email delivery failure
-   Expired verification token
-   Reused verification token
-   Multiple resend requests
-   Login before verification
-   Suspended account login
-   Disabled account login
-   Refresh after logout
-   Expired refresh token
-   Refresh-token reuse
-   Password reset requested repeatedly
-   Password reset after token expiry
-   Password reset after token use
-   Concurrent password-reset submissions
-   Browser cookie restrictions
-   Network interruption during submission

------------------------------------------------------------------------

# 46. Acceptance Criteria

## Registration

-   Guest can choose Attendee, Vendor or Partner
-   Wizard displays correct role-specific fields
-   Invalid steps cannot advance
-   Duplicate email is rejected safely
-   Password policy is enforced
-   User and correct profile are created atomically
-   Account begins pending verification
-   Verification email is requested
-   No password is returned or logged

## Verification

-   Valid token activates account
-   Invalid token is rejected
-   Expired token is rejected
-   Used token cannot be reused
-   Resend flow is rate-limited and neutral

## Login

-   Active verified user can log in
-   Invalid credentials return a generic error
-   Pending account is directed to verification
-   Suspended and disabled accounts are blocked
-   Access token is returned
-   Refresh cookie is secure and HTTP-only
-   Session is persisted

## Refresh

-   Valid refresh token rotates successfully
-   Previous token is invalidated
-   Revoked or expired sessions fail
-   Reuse detection revokes the affected session

## Logout

-   Current session is revoked
-   Cookie is cleared
-   Logout-all revokes every user session

## Recovery

-   Forgot-password response is neutral
-   Valid reset token changes the password
-   Existing sessions are revoked
-   Used or expired tokens fail
-   Password-change email is sent

------------------------------------------------------------------------

# 47. Testing Requirements

Unit tests:

-   Password validation
-   Email normalization
-   Token generation and hashing
-   DTO sanitization
-   Role-specific registration logic
-   Account-status rules

Service tests:

-   Attendee registration
-   Vendor registration
-   Partner registration
-   Duplicate email
-   Verification
-   Login
-   Refresh rotation
-   Logout
-   Password reset

Integration tests:

-   Every authentication endpoint
-   Cookie behavior
-   Rate limiting
-   Validation errors
-   Database rollback
-   Session revocation

Security tests:

-   Enumeration resistance
-   Invalid token handling
-   Refresh-token reuse
-   Credential exclusion
-   Protected endpoint access

------------------------------------------------------------------------

# 48. Definition of Done

FS-001 is implemented only when:

-   All acceptance criteria pass
-   Database migration is reviewed
-   Authentication API is documented
-   Backend tests pass
-   Frontend flows are responsive
-   Accessibility requirements are verified
-   Email templates work
-   Session rotation works
-   Logout and logout-all work
-   Password recovery works
-   No credentials appear in logs or responses
-   Security review is complete
-   Documentation is updated

------------------------------------------------------------------------

# 49. Implementation Sequence

IMP-004 should follow this order:

1.  Add `AuthToken` schema and migration
2.  Add authentication constants and schemas
3.  Add password and token utilities
4.  Add auth repository
5.  Add registration service
6.  Add verification service
7.  Add login service
8.  Add session and refresh service
9.  Add logout flows
10. Add password-recovery flows
11. Add email abstraction and templates
12. Add controllers and routes
13. Add authentication middleware
14. Add rate limiters
15. Add unit and integration tests
16. Build frontend authentication pages
17. Build registration wizard
18. Integrate frontend and backend
19. Run security and acceptance testing

------------------------------------------------------------------------

# 50. Future Enhancements

-   Social authentication
-   Multi-factor authentication
-   Passkeys
-   Passwordless email links
-   Device-management dashboard
-   Multiple roles per user
-   Organization team accounts
-   Risk-based login detection
-   CAPTCHA after suspicious activity

------------------------------------------------------------------------

# 51. Next Document

Proceed to:

> **IMP-004 --- Authentication & Registration Implementation**

IMP-004 will translate this specification into:

-   Prisma migration
-   Backend files
-   Zod schemas
-   Repositories
-   Services
-   Controllers
-   Routes
-   Authentication middleware
-   Email templates
-   Tests
-   Frontend registration wizard
-   Login and recovery screens
-   Verification steps

------------------------------------------------------------------------

# Developer Notes

Authentication is a security boundary, not merely a set of forms.
Implementation must preserve separation between HTTP concerns, business
rules, persistence, token handling and external email delivery.

Vendor and partner registration creates an identity and draft profile.
It does not approve participation, sponsorship or partnership. Those
decisions belong to later application-review workflows.

Where provider details remain unconfirmed, use abstractions and avoid
embedding vendor-specific logic into the authentication domain.
