import type { NextFunction, RequestHandler } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ZodType } from 'zod';

import { ApiError } from '../shared/errors/api-error.js';

function parseOrThrow<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ApiError({
      statusCode: 400,
      message: 'Validation failed.',
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  return result.data;
}

export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (request, _response, next: NextFunction) => {
    request.body = parseOrThrow(schema, request.body);
    next();
  };
}

export function validateParams<T extends ParamsDictionary>(schema: ZodType<T>): RequestHandler {
  return (request, _response, next: NextFunction) => {
    request.params = parseOrThrow(schema, request.params);
    next();
  };
}

export function validateQuery<T>(schema: ZodType<T>): RequestHandler {
  return (request, response, next: NextFunction) => {
    response.locals.validatedQuery = parseOrThrow(schema, request.query);
    next();
  };
}
