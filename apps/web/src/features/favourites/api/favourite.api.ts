import { apiClient } from "@lib/api-client";
import type { Favourite, FavouriteType } from "../types/favourite.types";

export interface FavouriteTarget {
  type: FavouriteType;
  id: string;
}

export async function getFavourites(
  workspaceId: string,
): Promise<Favourite[]> {
  const response = await apiClient.get("/favourites", {
    params: { workspaceId },
  });

  return response.data.data;
}


export async function addFavourite(
  target: FavouriteTarget,
): Promise<void> {
  await apiClient.post("/favourites", target);
}


export async function removeFavourite(
  target: FavouriteTarget,
): Promise<void> {
  await apiClient.delete("/favourites", {
    data: target,
  });
}