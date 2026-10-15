import { ApiError } from './api-error.js';

export class GalleryNotFoundError extends ApiError {
  public constructor(id: string) {
    super({
      statusCode: 404,
      message: `Gallery item '${id}' was not found.`,
    });
  }
}
