import { useCallback, useEffect, useState } from "react";

import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { isApiError, type ApiErrorCode } from "@/services/http";
import { searchIndianCities } from "@/services/geocodingApi";
import type { CitySearchResult } from "@/types/search";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 400;

export type CitySearchStatus = "idle" | "loading" | "ready" | "error";

type SearchState = {
  status: CitySearchStatus;
  query: string;
  results: CitySearchResult[];
  errorCode: ApiErrorCode | null;
};

// Searches Indian places as the user types. Requests are debounced and
// cancelled when the query changes.
export function useCitySearch(rawQuery: string) {
  const trimmed = rawQuery.trim();
  const query = useDebouncedValue(trimmed, DEBOUNCE_MS);
  const [retryToken, setRetryToken] = useState(0);
  const [state, setState] = useState<SearchState>({
    status: "idle",
    query: "",
    results: [],
    errorCode: null,
  });

  useEffect(() => {
    if (query.length < MIN_QUERY_LENGTH) {
      setState({ status: "idle", query, results: [], errorCode: null });
      return;
    }

    const controller = new AbortController();
    setState((previous) => ({ ...previous, status: "loading", query }));

    searchIndianCities(query, controller.signal)
      .then((results) => {
        if (controller.signal.aborted) return;
        setState({ status: "ready", query, results, errorCode: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          query,
          results: [],
          errorCode: isApiError(error) ? error.code : "invalid-data",
        });
      });

    return () => controller.abort();
  }, [query, retryToken]);

  const retry = useCallback(() => setRetryToken((token) => token + 1), []);

  return {
    ...state,
    isTooShort: trimmed.length > 0 && trimmed.length < MIN_QUERY_LENGTH,
    isPending: trimmed !== query,
    retry,
  };
}
