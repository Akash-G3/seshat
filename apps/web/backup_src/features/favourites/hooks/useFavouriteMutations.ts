import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addFavourite,
  removeFavourite,
  type FavouriteTarget,
} from "../api/favourite.api";

export function useAddFavourite(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (target: FavouriteTarget) => addFavourite(target),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["favourites", workspaceId],
      });
    },
  });
}

export function useRemoveFavourite(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (target: FavouriteTarget) => removeFavourite(target),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["favourites", workspaceId],
      });
    },
  });
}