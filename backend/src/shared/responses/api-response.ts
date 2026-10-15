export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: ApiErrorDetail[];
  code?: string;
  data?: Record<string, unknown>;
}

export function successResponse<T>(message: string, data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

export function errorResponse(
  message: string,
  errors: ApiErrorDetail[] = [],
  code?: string,
  data?: Record<string, unknown>,
): ApiErrorResponse {
  return {
    success: false,
    message,
    errors,
    ...(code !== undefined ? { code } : {}),
    ...(data !== undefined ? { data } : {}),
  };
}
