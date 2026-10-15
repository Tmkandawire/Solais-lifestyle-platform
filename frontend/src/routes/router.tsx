import { createBrowserRouter } from "react-router-dom";

import AppLayout from "../layouts/AppLayout";

import HomePage from "../pages/Home";
import AboutPage from "../pages/About";
import ExperiencesPage from "../pages/Experiences";
import EventsPage from "../pages/Events";
import OrderSummaryPage from "../components/events/OrderSummary";
import GalleryPage from "../pages/Gallery";
import ContactPage from "../pages/Contact";
import VendorsPage from "../pages/Vendors";
import PartnersPage from "../pages/Partners";

import LoginPage from "../pages/Login";
import RegisterPage from "../pages/Register";

import { AttendeeShell } from "../components/attendee/AttendeeShell";
import AttendeeDashboard from "../pages/Attendee/Dashboard";
import AttendeeEventsPage from "../pages/Attendee/Events";
import AttendeeTicketsPage from "../pages/Attendee/Tickets";
import AttendeeMyTicketsPage from "../pages/Attendee/MyTickets";
import AttendeeOrdersPage from "../pages/Attendee/Orders";
import AttendeeOrderDetailsPage from "../pages/Attendee/Orders/OrderDetails";
import AttendeeCheckoutPage from "../pages/Attendee/Checkout";
import EventDetailsPage from "../components/events/EventDetailsPage";
import AttendeeProfilePage from "../pages/Attendee/Profile";
import AttendeeNotificationsPage from "../pages/Attendee/Notifications";
import AttendeeAnnouncementsPage from "../pages/Attendee/Announcements";
import AttendeeSettingsPage from "../pages/Attendee/Settings";
import { AdminShell } from "../components/admin/AdminShell";
import AdminDashboardPage from "../pages/Admin/Dashboard";
import AdminEventsPage from "../pages/Admin/Events";
import AdminCreateEventPage from "../pages/Admin/Events/New";
import AdminEventDetailPage from "../pages/Admin/Events/Detail";
import AdminEditEventPage from "../pages/Admin/Events/Edit";
import AdminTicketsPage from "../pages/Admin/Tickets";

import AdminOrdersPage from "../pages/Admin/Orders";
import AdminAttendeesPage from "../pages/Admin/attendees";
import AdminCreateTicketTypePage from "../pages/Admin/Tickets/New";
import AdminTicketTypeDetailPage from "../pages/Admin/Tickets/Detail";
import AdminEditTicketTypePage from "../pages/Admin/Tickets/Edit";
import AdminGalleryPage from "../pages/Admin/Gallery";
import AdminVendorApplicationsPage from "../pages/Admin/VendorApplications";
import AdminVendorApplicationDetailPage from "../pages/Admin/VendorApplications/Detail";
import AdminPartnerApplicationsPage from "../pages/Admin/PartnerApplications";
import AdminPartnerApplicationDetailPage from "../pages/Admin/PartnerApplications/Detail";
import AdminIssuedTicketsPage from "../pages/Admin/IssuedTickets";
import AdminCommunicationsPage from "../pages/Admin/Communications";
import AdminAnnouncementsPage from "../pages/Admin/Announcements";
import AdminSettingsPage from "../pages/Admin/Settings";

export const router = createBrowserRouter([
  // =========================================================
  // MARKETING WEBSITE
  // =========================================================
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "experiences",
        element: <ExperiencesPage />,
      },
      {
        path: "events",
        element: <EventsPage />,
      },
      {
        path: "events/:id",
        element: <EventDetailsPage />,
      },
      {
        path: "events/:eventId/order-summary",
        element: <OrderSummaryPage />,
      },
      {
        path: "gallery",
        element: <GalleryPage />,
      },
      {
        path: "contact",
        element: <ContactPage />,
      },
      {
        path: "vendors/apply",
        element: <VendorsPage />,
      },
      {
        path: "partners/apply",
        element: <PartnersPage />,
      },
    ],
  },

  // =========================================================
  // AUTHENTICATION
  // =========================================================
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

  // =========================================================
  // ATTENDEE PORTAL
  // =========================================================
  {
    path: "/account",
    element: <AttendeeShell />,
    children: [
      {
        index: true,
        element: <AttendeeDashboard />,
      },
      {
        path: "events",
        element: <AttendeeEventsPage />,
      },
      {
        path: "events/:eventId/tickets",
        element: <AttendeeTicketsPage />,
      },
      {
        path: "tickets",
        element: <AttendeeMyTicketsPage />,
      },
      {
        path: "orders",
        element: <AttendeeOrdersPage />,
      },
      {
        path: "orders/:id",
        element: <AttendeeOrderDetailsPage />,
      },
      {
        path: "orders/:id/checkout",
        element: <AttendeeCheckoutPage />,
      },
      {
        path: "profile",
        element: <AttendeeProfilePage />,
      },
      {
        path: "settings",
        element: <AttendeeSettingsPage />,
      },
      {
        path: "notifications",
        element: <AttendeeNotificationsPage />,
      },
      {
        path: "announcements",
        element: <AttendeeAnnouncementsPage />,
      },
    ],
  },

  // =========================================================
  // ADMIN PORTAL
  // =========================================================
  {
    path: "/admin",
    element: <AdminShell />,
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
      {
        path: "events",
        children: [
          {
            index: true,
            element: <AdminEventsPage />,
          },
          {
            path: "new",
            element: <AdminCreateEventPage />,
          },
          { path: ":id/edit", element: <AdminEditEventPage /> },
          {
            path: ":id",
            element: <AdminEventDetailPage />,
          },
        ],
      },
      {
        path: "tickets",
        children: [
          {
            index: true,
            element: <AdminTicketsPage />,
          },
          {
            path: "new",
            element: <AdminCreateTicketTypePage />,
          },
          {
            path: ":id/edit",
            element: <AdminEditTicketTypePage />,
          },
          {
            path: ":id",
            element: <AdminTicketTypeDetailPage />,
          },
        ],
      },

      {
        path: "orders",
        element: <AdminOrdersPage />,
      },
      {
        path: "attendees",
        element: <AdminAttendeesPage />,
      },

      {
        path: "issued-tickets",
        element: <AdminIssuedTicketsPage />,
      },
      {
        path: "gallery",
        element: <AdminGalleryPage />,
      },
      {
        path: "communications",
        element: <AdminCommunicationsPage />,
      },
      {
        path: "announcements",
        element: <AdminAnnouncementsPage />,
      },
      {
        path: "settings",
        element: <AdminSettingsPage />,
      },
      {
        path: "vendors",
        children: [
          {
            index: true,
            element: <AdminVendorApplicationsPage />,
          },
          {
            path: ":id",
            element: <AdminVendorApplicationDetailPage />,
          },
        ],
      },
      {
        path: "partners",
        children: [
          {
            index: true,
            element: <AdminPartnerApplicationsPage />,
          },
          {
            path: ":id",
            element: <AdminPartnerApplicationDetailPage />,
          },
        ],
      },
    ],
  },
]);
