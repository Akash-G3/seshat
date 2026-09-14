import { apiClient } from "@lib/api-client";

export interface SearchResult {
  id: string;
  title: string;
  type: "note" | "notebook";
  notebookId: string | null;
  score: number;
}

export async function searchWorkspace(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResult[]> {
  const response = await apiClient.get("/search", {
    params: { q: query },
    signal,
  });

  return response.data.data;
}
