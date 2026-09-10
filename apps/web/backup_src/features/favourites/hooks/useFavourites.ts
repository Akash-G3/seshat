import { useQuery } from "@tanstack/react-query";
import { getFavourites } from "../api/favourite.api";

export function useFavourites(workspaceId: string) {
  return useQuery({
    queryKey: ["favourites", workspaceId],
    queryFn: () => getFavourites(workspaceId),
    enabled: !!workspaceId,
  });
}