# Engineering Design Document

# 06-UI-Design-System

  Property        Value
  --------------- ----------------------------
  Document ID     ENG-006
  Version         0.1
  Status          Approved
  Project         Solaís Lifestyle Platform
  Design System   Radix UI + Tailwind CSS v4

------------------------------------------------------------------------

# 1. Purpose

This document defines the visual language and design system for the
Solaís Lifestyle Platform. It establishes reusable UI standards to
ensure every page, dashboard and component feels consistent, elegant and
unmistakably Solaís.

------------------------------------------------------------------------

# 2. Design Philosophy

The user experience should communicate:

-   Premium
-   Elegant
-   Warm
-   Modern
-   Minimal
-   Sophisticated
-   Community-driven

The interface should feel closer to a luxury hospitality brand than a
traditional ticketing website.

------------------------------------------------------------------------

# 3. Brand Personality

The UI should evoke:

-   Luxury hotels
-   Boutique lifestyle brands
-   Premium networking events
-   Modern architecture
-   Editorial magazines

Avoid loud, cluttered or overly playful interfaces.

------------------------------------------------------------------------

# 4. Color System

Derived from the Solaís logo.

## Primary Dark

Deep Forest Green

Suggested Token: `#1F2D2B`

Used for: - Navigation - Hero backgrounds - Footer - Admin sidebar -
Dark mode surfaces

------------------------------------------------------------------------

## Primary Light

Warm Ivory

Suggested Token: `#F4F0E6`

Used for: - Backgrounds - Cards - Marketing pages - Forms

------------------------------------------------------------------------

## Accent

Elegant Gold

Suggested Token: `#C79A5B`

Used for: - Buttons - Links - Icons - Dividers - Highlights

------------------------------------------------------------------------

## Supporting Colors

Success `#2E7D32`

Warning `#EDB200`

Error `#C62828`

Info `#2563EB`

------------------------------------------------------------------------

# 5. Theme Strategy

The application supports:

## Light Theme

-   Warm Ivory backgrounds
-   Deep Green typography
-   Gold accents

## Dark Theme

-   Deep Green backgrounds
-   Warm Ivory typography
-   Gold highlights

The transition should preserve brand identity rather than simply
inverting colors.

------------------------------------------------------------------------

# 6. Typography

Primary Font

**Manrope**

Fallback

Inter

Hierarchy

-   Display
-   H1
-   H2
-   H3
-   Body
-   Caption

Typography should emphasize generous spacing and readability.

------------------------------------------------------------------------

# 7. Spacing System

8-point grid

4 8 12 16 24 32 48 64 96

------------------------------------------------------------------------

# 8. Border Radius

Buttons 12px

Cards 16px

Dialogs 20px

Hero Images 24px

------------------------------------------------------------------------

# 9. Shadows

Soft elevation.

No harsh drop shadows.

Cards should appear layered rather than floating.

------------------------------------------------------------------------

# 10. Component Library

Built using Radix UI.

Core Components

-   Button
-   Card
-   Input
-   Textarea
-   Select
-   Checkbox
-   Radio
-   Dialog
-   Drawer
-   Sheet
-   Tabs
-   Accordion
-   Tooltip
-   Dropdown
-   Avatar
-   Badge
-   Toast
-   Table
-   Pagination
-   Breadcrumb

------------------------------------------------------------------------

# 11. Buttons

Primary

Gold background

Dark text

Rounded

Medium elevation

Secondary

Outlined

Ghost

Minimal

Destructive

Red

------------------------------------------------------------------------

# 12. Cards

Cards are the primary content container.

Used for:

-   Events
-   Tickets
-   Vendors
-   Partners
-   Analytics
-   Journal Articles

All cards share consistent spacing and padding.

------------------------------------------------------------------------

# 13. Forms

Forms use:

React Hook Form

Zod Validation

Inline validation

Clear helper text

Large touch targets

------------------------------------------------------------------------

# 14. Navigation

Desktop

Top navigation

Admin sidebar

Dashboard sidebar

Mobile

Hamburger navigation

Bottom actions where appropriate

------------------------------------------------------------------------

# 15. Icons

Lucide React

Consistent stroke width

Minimal styling

------------------------------------------------------------------------

# 16. Motion

Framer Motion

Use animation sparingly.

Examples

-   Page transitions
-   Modal animations
-   Hover effects
-   Ticket purchase success
-   Dashboard statistics

Avoid unnecessary movement.

------------------------------------------------------------------------

# 17. Responsive Breakpoints

Mobile

Tablet

Laptop

Desktop

Large Desktop

Every feature is designed mobile-first.

------------------------------------------------------------------------

# 18. Accessibility

WCAG AA target.

Keyboard navigation.

Visible focus states.

Proper contrast.

ARIA support.

Semantic HTML.

------------------------------------------------------------------------

# 19. Dashboard Design

Dashboards prioritize:

-   Clarity
-   Quick actions
-   Analytics
-   Recent activity
-   Status indicators

Avoid overwhelming users.

------------------------------------------------------------------------

# 20. Marketing Pages

Marketing pages emphasize:

Large photography

Strong typography

Whitespace

Elegant animations

Event storytelling

Editorial layout

Until real photography exists, premium abstract gradients, subtle
textures and tasteful illustrations will be used as placeholders.

------------------------------------------------------------------------

# 21. Design Tokens

Colors

Typography

Spacing

Radius

Elevation

Animation

Z-index

Opacity

All design decisions should reference tokens rather than hardcoded
values.

------------------------------------------------------------------------

# 22. Developer Notes

The Solaís design system is intentionally brand-first. Every component
should reinforce elegance, trust and exclusivity. The combination of
deep forest green, warm ivory and elegant gold creates a distinctive
visual identity that works equally well in light and dark themes. All
new components must be built using reusable Radix UI primitives and
conform to the established design tokens.

------------------------------------------------------------------------

# Revision History

  Version   Description
  --------- --------------------------
  0.1       Initial UI Design System
