# Engineering Design Document

# 08-Deployment-Architecture

  Property      Value
  ------------- ---------------------------
  Document ID   ENG-008
  Version       0.1
  Status        Approved
  Project       Solaís Lifestyle Platform

------------------------------------------------------------------------

# 1. Purpose

This document defines the deployment architecture, infrastructure,
environments, release strategy and operational practices for the Solaís
Lifestyle Platform. It ensures the platform can be deployed
consistently, securely and reliably from development through production.

------------------------------------------------------------------------

# 2. Deployment Objectives

-   Reliable deployments
-   Secure infrastructure
-   Environment consistency
-   High availability
-   Easy rollback
-   Scalable architecture
-   Automated releases

------------------------------------------------------------------------

# 3. Environments

## Development

Used for local feature development.

## Staging

Production-like environment used for QA, client demonstrations and user
acceptance testing.

## Production

Public-facing environment used by Solaís customers.

------------------------------------------------------------------------

# 4. Infrastructure Overview

``` text
Users
  │
  ▼
Vercel (React Frontend)
  │
  ▼
Express API (Railway / Render)
  │
  ▼
PostgreSQL Database
  │
  ├── Cloudinary
  ├── Email Provider
  └── Payment Gateway
```

------------------------------------------------------------------------

# 5. Hosting Strategy

Frontend - Vercel

Backend - Railway (preferred) - Render (alternative)

Database - PostgreSQL

Media - Cloudinary

Email - Resend or Brevo

Payment - Provider to be confirmed

------------------------------------------------------------------------

# 6. Domain Strategy

Production - www.solaislifestyle.com

API - api.solaislifestyle.com

Future - admin.solaislifestyle.com (optional)

HTTPS enforced across all domains.

------------------------------------------------------------------------

# 7. Environment Variables

Frontend - VITE_API_URL - VITE_CLOUDINARY_CLOUD_NAME

Backend - DATABASE_URL - JWT_SECRET - JWT_REFRESH_SECRET -
CLOUDINARY_API_KEY - CLOUDINARY_API_SECRET - EMAIL_API_KEY -
PAYMENT_SECRET - CORS_ORIGIN

Secrets must never be committed to source control.

------------------------------------------------------------------------

# 8. CI/CD Pipeline

1.  Developer pushes to GitHub
2.  Automated build
3.  Linting
4.  Unit tests
5.  Build validation
6.  Deploy to staging
7.  Manual approval (production)
8.  Production deployment

------------------------------------------------------------------------

# 9. Release Strategy

-   Feature branches
-   Pull Requests
-   Code review
-   Tagged releases
-   Semantic versioning
-   Rollback support

------------------------------------------------------------------------

# 10. Database Deployment

-   Prisma migrations
-   Migration history tracked
-   Backup before production migrations
-   Rollback plan documented

------------------------------------------------------------------------

# 11. Static Assets

Cloudinary stores: - Event banners - Gallery images - User avatars -
Vendor documents - Partner documents

No user uploads stored on the application server.

------------------------------------------------------------------------

# 12. Monitoring

Monitor: - API uptime - Response times - Database health - Payment
failures - Email delivery - Application errors

------------------------------------------------------------------------

# 13. Logging

Application logs - Winston

Infrastructure logs - Hosting platform

Audit logs - PostgreSQL

------------------------------------------------------------------------

# 14. Backup Strategy

Database - Automated daily backups

Media - Cloudinary redundancy

Source Code - GitHub repository

Documentation - Version controlled Markdown

------------------------------------------------------------------------

# 15. Disaster Recovery

Recovery priorities:

1.  Restore database
2.  Restore API
3.  Restore frontend
4.  Validate integrations
5.  Resume service

Recovery procedures should be documented and periodically tested.

------------------------------------------------------------------------

# 16. Scaling Strategy

Horizontal scaling: - Stateless API instances - Database optimization -
CDN for media

Future: - Redis caching - Background job processing - Queue workers

------------------------------------------------------------------------

# 17. Deployment Checklist

-   Environment variables configured
-   Database migrations executed
-   HTTPS enabled
-   CORS verified
-   Health checks passing
-   Monitoring enabled
-   Backups verified
-   Smoke tests completed

------------------------------------------------------------------------

# 18. Developer Notes

Deployment is infrastructure-as-code in spirit, with repeatable,
documented processes. The frontend, backend and supporting services
remain independently deployable, reducing operational risk and allowing
future scaling without architectural changes.

------------------------------------------------------------------------

# Revision History

  Version   Description
  --------- ---------------------------------
  0.1       Initial deployment architecture
