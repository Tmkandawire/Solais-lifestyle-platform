import { useCallback, useEffect, useRef, useState } from "react";

import {
  approvePartnerApplication,
  createPartnerApplication,
  deletePartnerApplication,
  getAdminPartnerApplicationById,
  getAdminPartnerApplications,
  rejectPartnerApplication,
} from "../api/partner-application.api";

import { extractErrorMessage } from "../hooks/shared/extractErrorMessage";

import type {
  AdminPartnerApplicationDetail,
  PaginatedPartnerApplications,
  ReviewPartnerApplicationPayload,
  PartnerApplicationListParams,
} from "../types/partner-application";

/**
 * Admin: fetch and manage the paginated partner application list.
 * Same derived-loading + latestRequestId pattern as useAdminEvents —
 * no synchronous setState in the effect body.
 */
export function useAdminPartnerApplications(
  params?: PartnerApplicationListParams,
) {
  const { page, limit, status } = params ?? {};

  const [result, setResult] = useState<{
    key: string | undefined;
    data: PaginatedPartnerApplications;
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

    getAdminPartnerApplications({ page, limit, status })
      .then((data) => {
        if (latestRequestId.current !== requestId) return;
        setResult({ key: requestKey, data });
        setError(null);
      })
      .catch((err: unknown) => {
        if (latestRequestId.current !== requestId) return;
        setError(
          extractErrorMessage(err, "Failed to load partner applications."),
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
 * Admin: fetch a single partner application (with related event/reviewer).
 */
export function useAdminPartnerApplication(id?: string) {
  const [result, setResult] = useState<{
    key: string | undefined;
    application: AdminPartnerApplicationDetail | null;
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

    getAdminPartnerApplicationById(id)
      .then((application) => {
        if (latestRequestId.current !== requestId) return;
        setResult({ key: requestKey, application });
        setError(null);
      })
      .catch((err: unknown) => {
        if (latestRequestId.current !== requestId) return;
        setError(
          extractErrorMessage(err, "Failed to load partner application."),
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
 * useAdminEvent.ts's private useAdminEventAction and from Vendor's
 * useVendorApplicationAction, rather than imported, since that helper
 * isn't exported — this repeats the already-flagged follow-up debt
 * (extract a single shared factory all three files can use).
 */
function usePartnerApplicationAction<TArgs extends unknown[], TResult>(
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
 * Public: submit a new partner application. No auth required.
 */
export function useCreatePartnerApplication() {
  const { execute, isLoading, error } = usePartnerApplicationAction(
    createPartnerApplication,
    "Failed to submit partner application.",
  );
  return { submit: execute, isLoading, error };
}

export function useApprovePartnerApplication() {
  const { execute, isLoading, error } = usePartnerApplicationAction(
    (id: string, payload?: ReviewPartnerApplicationPayload) =>
      approvePartnerApplication(id, payload),
    "Failed to approve partner application.",
  );
  return { approve: execute, isLoading, error };
}

export function useRejectPartnerApplication() {
  const { execute, isLoading, error } = usePartnerApplicationAction(
    (id: string, payload?: ReviewPartnerApplicationPayload) =>
      rejectPartnerApplication(id, payload),
    "Failed to reject partner application.",
  );
  return { reject: execute, isLoading, error };
}

export function useDeletePartnerApplication() {
  const { execute, isLoading, error } = usePartnerApplicationAction(
    deletePartnerApplication,
    "Failed to delete partner application.",
  );
  return { remove: execute, isLoading, error };
}
