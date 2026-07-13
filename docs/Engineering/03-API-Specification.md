# Engineering Design Document

# 03-API-Specification

  Property      Value
  ------------- ---------------------------
  Document ID   ENG-003
  Version       0.1
  Status        Approved
  Project       Solaís Lifestyle Platform
  API Style     REST
  Data Format   JSON

------------------------------------------------------------------------

# 1. Purpose

This document defines the API contract between the frontend and backend.
It standardizes endpoint design, authentication, request/response
structures, validation, pagination, filtering, versioning and error
handling.

# 2. API Principles

-   RESTful endpoints
-   Stateless requests
-   JSON payloads
-   Versioned APIs (/api/v1)
-   Consistent responses
-   Validation before business logic
-   JWT authentication
-   RBAC authorization

# 3. Base URL

`/api/v1`

# 4. Authentication

Protected endpoints require:

`Authorization: Bearer <access_token>`

Refresh tokens are stored in secure HTTP-only cookies.

# 5. Standard Response

## Success

``` json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

## Error

``` json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

# 6. Endpoint Groups

-   Authentication
-   Users
-   Events
-   Tickets
-   Orders
-   Payments
-   Vendors
-   Partners
-   Gallery
-   Journal
-   Newsletter
-   Contact
-   Notifications
-   Administration
-   Analytics

# 7. Authentication Endpoints

  Method   Endpoint
  -------- -----------------------
  POST     /auth/register
  POST     /auth/login
  POST     /auth/logout
  POST     /auth/refresh
  POST     /auth/verify-email
  POST     /auth/forgot-password
  POST     /auth/reset-password
  GET      /auth/me

# 8. User Endpoints

  Method   Endpoint
  -------- -----------------
  GET      /users/profile
  PATCH    /users/profile
  PATCH    /users/avatar
  PATCH    /users/password

# 9. Event Endpoints

  Method   Endpoint
  -------- ----------------------
  GET      /events
  GET      /events/{slug}
  POST     /events
  PATCH    /events/{id}
  DELETE   /events/{id}
  PATCH    /events/{id}/publish
  PATCH    /events/{id}/archive

Supports search, filtering and pagination.

# 10. Ticket Endpoints

  Method   Endpoint
  -------- ------------------------
  GET      /events/{id}/tickets
  POST     /tickets/purchase
  GET      /tickets/my
  GET      /tickets/{id}
  POST     /tickets/{id}/download

# 11. Order Endpoints

  Method   Endpoint
  -------- --------------
  POST     /orders
  GET      /orders/my
  GET      /orders/{id}

# 12. Payment Endpoints

  Method   Endpoint
  -------- ----------------------
  POST     /payments/initialize
  POST     /payments/verify
  POST     /payments/webhook
  GET      /payments/{id}

# 13. Vendor Endpoints

  Method   Endpoint
  -------- --------------------------
  POST     /vendors/applications
  GET      /vendors/applications/me
  PATCH    /vendors/profile

# 14. Partner Endpoints

  Method   Endpoint
  -------- ---------------------------
  POST     /partners/applications
  GET      /partners/applications/me
  PATCH    /partners/profile

# 15. Gallery Endpoints

  Method   Endpoint
  -------- -----------------
  GET      /gallery
  GET      /gallery/{id}
  POST     /gallery
  POST     /gallery/images

# 16. Journal Endpoints

  Method   Endpoint
  -------- -----------------
  GET      /journal
  GET      /journal/{slug}
  POST     /journal
  PATCH    /journal/{id}

# 17. Contact & Newsletter

  Method   Endpoint
  -------- -------------------------
  POST     /contact
  POST     /newsletter/subscribe
  DELETE   /newsletter/unsubscribe

# 18. Administration

Administrative resources include Users, Events, Orders, Payments,
Vendors, Partners, Gallery, Journal, Dashboard, Analytics and Settings.

# 19. Analytics

  Method   Endpoint
  -------- ----------------------
  GET      /analytics/dashboard
  GET      /analytics/events
  GET      /analytics/revenue
  GET      /analytics/attendees

# 20. Pagination

`?page=1&limit=10`

# 21. Filtering

Supports search, category, status, startDate, endDate, sort and order
query parameters.

# 22. HTTP Status Codes

200, 201, 204, 400, 401, 403, 404, 409, 422, 500

# 23. Security

-   JWT
-   Refresh Tokens
-   RBAC
-   Zod Validation
-   Helmet
-   Rate Limiting
-   Secure Cookies
-   CORS
-   Audit Logging

# 24. Versioning

Current API version:

`/api/v1`

# 25. Developer Notes

The API is organized around business domains. Each module exposes only
its own resources, follows a consistent response contract and integrates
with external services through dedicated abstraction layers.

# Revision History

  Version   Description
  --------- ---------------------------
  0.1       Initial API specification
