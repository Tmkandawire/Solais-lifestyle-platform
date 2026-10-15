export function extractErrorMessage(err: unknown, fallback: string): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as { response?: unknown }).response === "object"
  ) {
    const response = (
      err as {
        response?: {
          data?: {
            message?: unknown;
          };
        };
      }
    ).response;

    const backendMessage = response?.data?.message;

    if (typeof backendMessage === "string" && backendMessage.length > 0) {
      return backendMessage;
    }
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}
