# ADR-001 — Application Architecture

## Status

Accepted

## Context

The Solaís Lifestyle Platform requires a modern marketing website, event management, online ticketing, user accounts, vendor and partner workflows, content management, and an administration dashboard.

The frontend and backend must be independently maintainable and deployable.

## Decision

The platform will use:

- React and TypeScript for the frontend
- Vite as the frontend build tool
- Tailwind CSS for styling
- Radix UI for accessible interface primitives
- Node.js, Express, and TypeScript for the backend
- PostgreSQL as the relational database
- Prisma as the ORM

The frontend and backend will be developed as separate applications within one project repository.

## Consequences

### Benefits

- Clear separation of responsibilities
- Independent frontend and backend deployment
- Type safety across both applications
- Scalable relational data model
- Easier testing and maintenance

### Trade-offs

- Separate frontend and backend configuration
- Cross-origin and authentication-cookie configuration is required
- Deployment requires coordination between two applications
