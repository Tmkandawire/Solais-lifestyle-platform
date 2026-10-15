import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { notFoundMiddleware } from './middleware/not-found.middleware.js';
import { globalRateLimiter } from './middleware/rate-limit.middleware.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { accountRouter } from './modules/account/account.routes.js';
import { healthRouter } from './modules/health/health.routes.js';

import { eventRouter } from './modules/events/event.routes.js';
import { ticketRouter } from './modules/tickets/ticket.routes.js';
import { issuedTicketRouter } from './modules/issued-tickets/issued-ticket.routes.js';
import { orderRouter } from './modules/orders/order.routes.js';
import { adminOrderRouter } from './modules/orders/admin-order.routes.js';
import { adminAttendeeRouter } from './modules/attendees/admin-attendee.routes.js';
import { paymentRouter } from './modules/payments/payment.routes.js';
import { galleryRouter } from './modules/gallery/gallery.routes.js';
import { vendorApplicationRouter } from './modules/vendor-applications/vendor-application.routes.js';
import { partnerApplicationRouter } from './modules/partner-applications/partner-application.routes.js';
import { notificationRouter } from './modules/notifications/notification.routes.js';
import { contactMessageRouter } from './modules/contact-messages/contact-message.routes.js';
import { announcementRouter } from './modules/announcements/announcement.routes.js';
export const app = express();

app.disable('x-powered-by');

app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(compression());

app.use(express.json({ limit: '1mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
  }),
);

app.use(cookieParser());

app.use('/api/v1/health', healthRouter);

app.use(globalRateLimiter);

app.use('/api/v1/auth', authRouter);

app.use('/api/v1/account', accountRouter);

app.use('/api/v1/events', eventRouter);
app.use('/api/v1/vendor-applications', vendorApplicationRouter);
app.use('/api/v1/partner-applications', partnerApplicationRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/contact-messages', contactMessageRouter);
app.use('/api/v1/announcements', announcementRouter);
app.use('/api/v1/gallery', galleryRouter);
app.use('/api/v1/tickets', ticketRouter);
app.use('/api/v1/issued-tickets', issuedTicketRouter);

app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/admin/orders', adminOrderRouter);
app.use('/api/v1/admin/attendees', adminAttendeeRouter);
app.use('/api/v1/payments', paymentRouter);

app.use(notFoundMiddleware);

app.use(errorMiddleware);
