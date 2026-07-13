# Engineering Design Document

# 02-Database-Design

  Property      Value
  ------------- ---------------------------
  Document ID   ENG-002
  Version       0.1
  Status        Approved
  Project       Solaís Lifestyle Platform
  Database      PostgreSQL
  ORM           Prisma ORM

------------------------------------------------------------------------

# 1. Purpose

This document defines the logical database architecture for the Solaís
Lifestyle Platform. It specifies the entities, relationships, naming
conventions, integrity rules, indexing strategy, and design principles
that govern data storage.

------------------------------------------------------------------------

# 2. Database Goals

-   Normalize business data
-   Preserve data integrity
-   Support scalability
-   Minimize duplication
-   Optimize read/write performance
-   Support auditing
-   Enable future expansion

------------------------------------------------------------------------

# 3. Design Principles

-   UUID primary keys
-   Singular model names
-   Snake_case database columns
-   Prisma models map to PostgreSQL tables
-   Timestamps on every table
-   Soft deletes where business appropriate
-   Foreign keys enforce integrity
-   No duplicated business data

------------------------------------------------------------------------

# 4. Core Domains

Authentication Users Events Commerce Community Content Administration
Analytics

------------------------------------------------------------------------

# 5. Entity Overview

## Identity

-   User
-   Role
-   Session

## Community

-   AttendeeProfile
-   VendorProfile
-   PartnerProfile

## Events

-   Event
-   Venue
-   EventCategory
-   EventSchedule
-   FAQ
-   Sponsor

## Commerce

-   TicketType
-   Ticket
-   Order
-   OrderItem
-   Payment
-   DiscountCode
-   TicketScan

## Content

-   GalleryAlbum
-   GalleryImage
-   Article
-   ArticleCategory
-   NewsletterSubscriber
-   ContactMessage

## Administration

-   AuditLog
-   Notification

------------------------------------------------------------------------

# 6. High-Level Relationships

``` text
User
 ├── AttendeeProfile
 ├── VendorProfile
 ├── PartnerProfile
 ├── Orders
 └── Notifications

Event
 ├── TicketTypes
 ├── GalleryAlbum
 ├── EventSchedules
 ├── FAQs
 └── Sponsors

Order
 ├── OrderItems
 ├── Payment
 └── Tickets
```

------------------------------------------------------------------------

# 7. Core Tables

## users

Purpose: Stores authentication and identity.

Fields

-   id (UUID)
-   role_id
-   first_name
-   last_name
-   email
-   password_hash
-   phone
-   avatar_url
-   email_verified
-   account_status
-   created_at
-   updated_at

------------------------------------------------------------------------

## attendee_profiles

-   user_id
-   interests
-   newsletter_opt_in

------------------------------------------------------------------------

## vendor_profiles

-   user_id
-   business_name
-   category
-   website
-   social_links
-   products_services
-   approval_status

------------------------------------------------------------------------

## partner_profiles

-   user_id
-   organization_name
-   industry
-   website
-   sponsorship_interest
-   approval_status

------------------------------------------------------------------------

## events

-   id
-   title
-   slug
-   description
-   category_id
-   venue_id
-   banner_url
-   start_datetime
-   end_datetime
-   capacity
-   status
-   created_by

------------------------------------------------------------------------

## venues

-   id
-   name
-   address
-   city
-   country
-   latitude
-   longitude

------------------------------------------------------------------------

## ticket_types

-   id
-   event_id
-   name
-   description
-   price
-   quantity
-   quantity_sold
-   sales_start
-   sales_end

------------------------------------------------------------------------

## orders

-   id
-   user_id
-   order_number
-   status
-   total_amount
-   created_at

------------------------------------------------------------------------

## order_items

-   id
-   order_id
-   ticket_type_id
-   quantity
-   unit_price

------------------------------------------------------------------------

## payments

-   id
-   order_id
-   provider
-   provider_reference
-   amount
-   currency
-   status
-   verified_at

------------------------------------------------------------------------

## tickets

-   id
-   order_item_id
-   attendee_id
-   qr_code
-   qr_hash
-   status

------------------------------------------------------------------------

## ticket_scans

-   id
-   ticket_id
-   scanned_by
-   scanned_at
-   result

------------------------------------------------------------------------

## gallery_albums

-   id
-   event_id
-   title

------------------------------------------------------------------------

## gallery_images

-   id
-   album_id
-   cloudinary_public_id
-   image_url

------------------------------------------------------------------------

## articles

-   id
-   category_id
-   title
-   slug
-   excerpt
-   content
-   published_at

------------------------------------------------------------------------

## newsletter_subscribers

-   id
-   email
-   subscribed_at
-   active

------------------------------------------------------------------------

## contact_messages

-   id
-   full_name
-   email
-   phone
-   subject
-   message

------------------------------------------------------------------------

## audit_logs

-   id
-   actor_id
-   action
-   entity
-   entity_id
-   created_at

------------------------------------------------------------------------

# 8. Naming Conventions

-   UUID primary keys
-   \*\_id foreign keys
-   \*\_at timestamps
-   status enums where applicable

------------------------------------------------------------------------

# 9. Indexing Strategy

Indexes on:

-   email
-   slug
-   order_number
-   provider_reference
-   qr_hash
-   event start_datetime
-   ticket status

------------------------------------------------------------------------

# 10. Constraints

-   Email unique
-   Order number unique
-   QR hash unique
-   Slug unique
-   One attendee profile per user
-   One vendor profile per user
-   One partner profile per user

------------------------------------------------------------------------

# 11. Audit Fields

All transactional tables include:

-   created_at
-   updated_at
-   created_by (where applicable)

------------------------------------------------------------------------

# 12. Future Expansion

Reserved for:

-   Multi-organization support
-   Loyalty program
-   Referrals
-   Memberships
-   Seating
-   Mobile applications

------------------------------------------------------------------------

# 13. Developer Notes

The database is intentionally organized around business domains and a
unified identity model. Authentication data is isolated from
role-specific profile data. Commerce entities are independent from
content entities to preserve separation of concerns and simplify future
scaling.

------------------------------------------------------------------------

# Revision History

  Version   Description
  --------- -------------------------
  0.1       Initial database design
