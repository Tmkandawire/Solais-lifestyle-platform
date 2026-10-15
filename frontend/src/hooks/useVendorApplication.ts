import { useCallback, useEffect, useRef, useState } from "react";

import {
  approveVendorApplication,
  createVendorApplication,
  deleteVendorApplication,
  getAdminVendorApplicationById,
  getAdminVendorApplications,
  rejectVendorApplication,
} from "../api/vendor-application.api";

import { extractErrorMessage } from "../hooks/shared/extractErrorMessage";

import type {
  AdminVendorApplicationDetail,
  PaginatedVendorApplications,
  ReviewVendorApplicationPayload,
  VendorApplicationListParams,
} from "../types/vendor-application";

/**
 * Admin: fetch and manage the paginated vendor application list.
 * Same derived-loading + latestRequestId pattern as useAdminEvents —
 * no synchronous setState in the effect body.
 */
export function useAdminVendorApplications(
  params?: VendorApplicationListParams,
) {
  const { page, limit, status } = params ?? {};

  const [result, setResult] = useState<{
    key: string | undefined;
    data: PaginatedVendorApplications;
  }>({
    key: undefined,
    data: {
      data: [],
      meta: { total: 0, page: page ?? 1, limit: limit ?? 20, totalPages: 0 },
    },
  });

  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const latestRequestId = useRef(0);

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const requestKey = `${page ?? ""}:${limit ?? ""}:${status ?? ""}:${refreshToken}`;
  const isLoading = result.key !== requestKey;

  useEffect(() => {
    const requestId = ++latestRequestId.current;

    getAdminVendorApplications({ page, limit, status })
      .then((data) => {
        if (latestRequestId.current !== requestId) return;
        setResult({ key: requestKey, data });
        setError(null);
      })
      .catch((err: unknown) => {
        if (latestRequestId.current !== requestId) return;
        setError(
          extractErrorMessage(err, "Failed to load vendor applications."),
        );
        setResult((current) => ({ ...current, key: requestKey }));
      });
  }, [page, limit, status, refreshToken, requestKey]);

  return {
    applications: result.data.data,
    meta: result.data.meta,
    isLoading,
    error,
    refresh,
  };
}

/**
 * Admin: fetch a single vendor application (with related event/reviewer).
 */
export function useAdminVendorApplication(id?: string) {
  const [result, setResult] = useState<{
    key: string | undefined;
    application: AdminVendorApplicationDetail | null;
  }>({ key: undefined, application: null });

  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const latestRequestId = useRef(0);

  const refresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const requestKey = id ? `${id}:${refreshToken}` : undefined;
  const isLoading = requestKey !== undefined && result.key !== requestKey;

  useEffect(() => {
    if (!id || !requestKey) {
      return;
    }

    const requestId = ++latestRequestId.current;

    getAdminVendorApplicationById(id)
      .then((application) => {
        if (latestRequestId.current !== requestId) return;
        setResult({ key: requestKey, application });
        setError(null);
      })
      .catch((err: unknown) => {
        if (latestRequestId.current !== requestId) return;
        setError(
          extractErrorMessage(err, "Failed to load vendor application."),
        );
        setResult((current) => ({ ...current, key: requestKey }));
      });
  }, [id, requestKey]);

  return {
    application: result.application,
    isLoading,
    error,
    refresh,
  };
}

/**
 * Shared scaffolding for a single imperative mutation. Duplicated from
 * useAdminEvent.ts's private useAdminEventAction rather than imported,
 * since that helper isn't exported — this repeats the already-flagged
 * follow-up debt (extract a single shared factory both files can use).
 */
function useVendorApplicationAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
  fallbackMessage: string,
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult> => {
      setIsLoading(true);
      setError(null);

      try {
        return await action(...args);
      } catch (err) {
        setError(extractErrorMessage(err, fallbackMessage));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [action, fallbackMessage],
  );

  return { execute, isLoading, error };
}

/**
 * Public: submit a new vendor application. No auth required.
 */
export function useCreateVendorApplication() {
  const { execute, isLoading, error } = useVendorApplicationAction(
    createVendorApplication,
    "Failed to submit vendor application.",
  );
  return { submit: execute, isLoading, error };
}

export function useApproveVendorApplication() {
  const { execute, isLoading, error } = useVendorApplicationAction(
    (id: string, payload?: ReviewVendorApplicationPayload) =>
      approveVendorApplication(id, payload),
    "Failed to approve vendor application.",
  );
  return { approve: execute, isLoading, error };
}

export function useRejectVendorApplication() {
  const { execute, isLoading, error } = useVendorApplicationAction(
    (id: string, payload?: ReviewVendorApplicationPayload) =>
      rejectVendorApplication(id, payload),
    "Failed to reject vendor application.",
  );
  return { reject: execute, isLoading, error };
}

export function useDeleteVendorApplication() {
  const { execute, isLoading, error } = useVendorApplicationAction(
    deleteVendorApplication,
    "Failed to delete vendor application.",
  );
  return { remove: execute, isLoading, error };
}
