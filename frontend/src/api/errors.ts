import axios from "axios";

interface ApiErrorBody {
  message?: string;
  code?: string;
  data?: Record<string, unknown>;
}

export interface ParsedApiError {
  status: number | null;
  code: string | null;
  message: string;
  data: Record<string, unknown> | null;
}

export function parseApiError(
  error: unknown,
  fallback: string,
): ParsedApiError {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const body = error.response?.data;

    return {
      status: error.response?.status ?? null,
      code: body?.code ?? null,
      message:
        body?.message ??
        (error.response
          ? fallback
          : "Network error. Check your connection and try again."),
      data: body?.data ?? null,
    };
  }

  return {
    status: null,
    code: null,
    message: error instanceof Error ? error.message : fallback,
    data: null,
  };
}
