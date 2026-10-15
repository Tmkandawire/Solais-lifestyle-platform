import { useCallback, useEffect, useState } from "react";

import { getAdminAttendees } from "../api/admin-attendee.api";
import { ADMIN_ATTENDEES_PAGE_SIZE } from "../constants/admin-attendee";
import { extractErrorMessage } from "./shared/extractErrorMessage";

import type {
  AdminAttendeeList,
  AdminAttendeeListParams,
} from "../types/admin-attendee";

const EMPTY_RESULT: AdminAttendeeList = {
  attendees: [],
  meta: {
    total: 0,
    page: 1,
    limit: ADMIN_ATTENDEES_PAGE_SIZE,
    totalPages: 0,
  },
};

interface RequestResult {
  key: string;
  data: AdminAttendeeList;
  error: string | null;
}

export function useAdminAttendees(params: AdminAttendeeListParams = {}) {
  const {
    page = 1,
    limit = ADMIN_ATTENDEES_PAGE_SIZE,
    search,
    isActive,
  } = params;

  const normalizedSearch = search?.trim() ?? "";

  const [refreshVersion, setRefreshVersion] = useState(0);
  const [result, setResult] = useState<RequestResult | null>(null);

  const requestKey = JSON.stringify({
    page,
    limit,
    search: normalizedSearch,
    isActive: isActive ?? null,
    refreshVersion,
  });

  const loading = result?.key !== requestKey;

  const refetch = useCallback(() => {
    setRefreshVersion((current) => current + 1);
  }, [setRefreshVersion]);

  useEffect(() => {
    const controller = new AbortController();

    getAdminAttendees(
      {
        page,
        limit,
        ...(normalizedSearch ? { search: normalizedSearch } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
      controller.signal,
    )
      .then((data) => {
        if (controller.signal.aborted) return;

        setResult({
          key: requestKey,
          data,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;

        setResult({
          key: requestKey,
          data: EMPTY_RESULT,
          error: extractErrorMessage(error, "Failed to load attendees."),
        });
      });

    return () => controller.abort();
  }, [page, limit, normalizedSearch, isActive, requestKey]);

  return {
    attendees: result?.data.attendees ?? EMPTY_RESULT.attendees,
    meta: result?.data.meta ?? EMPTY_RESULT.meta,
    loading,
    error: loading ? null : (result?.error ?? null),
    refetch,
  };
}
