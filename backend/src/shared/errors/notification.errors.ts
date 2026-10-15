import { ApiError } from './api-error.js';

export class NotificationNotFoundError extends ApiError {
  constructor() {
    super({
      statusCode: 404,
      message: 'Notification not found.',
    });
  }
}
