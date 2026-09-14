import { useEffect, useRef, useState } from "react";
import { searchWorkspace, type SearchResult } from "./search.api";

const SEARCH_DEBOUNCE_MS = 200;

export function useSearch(query: string, enabled: boolean) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();

    if (!enabled || !trimmed) {
      requestId.current += 1;
      setResults([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const id = ++requestId.current;

    setIsLoading(true);

    const timer = setTimeout(() => {
      searchWorkspace(trimmed, controller.signal)
        .then((data) => {
          if (id === requestId.current) setResults(data);
        })
        .catch(() => {
          // Aborted requests are expected while the user is still typing.
          if (controller.signal.aborted) return;
          if (id === requestId.current) setResults([]);
        })
        .finally(() => {
          if (id === requestId.current) setIsLoading(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, enabled]);

  return { results, isLoading };
}
