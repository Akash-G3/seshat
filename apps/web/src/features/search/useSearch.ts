import { useEffect, useRef, useState } from "react";
import { searchWorkspace, type SearchResult } from "./search.api";

export function useSearch(query: string, enabled: boolean) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();
    if (!enabled || !trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const id = ++requestId.current;
    const timer = setTimeout(() => {
      searchWorkspace(trimmed)
        .then((data) => {
          if (id === requestId.current) setResults(data);
        })
        .catch(() => {
          if (id === requestId.current) setResults([]);
        })
        .finally(() => {
          if (id === requestId.current) setIsLoading(false);
        });
    }, 200);

    return () => clearTimeout(timer);
  }, [query, enabled]);

  return { results, isLoading };
}