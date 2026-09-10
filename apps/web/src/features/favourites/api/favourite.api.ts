import { apiClient } from "@lib/api-client";
import type { Favourite, FavouriteType } from "../types/favourite.types";

export interface FavouriteTarget {
  type: FavouriteType;
  id: string;
}

/**
 * Get every favourite belonging to the current workspace.
 *
 * The backend returns a single normalized collection containing
 * both notes and notebooks.
 */
export async function getFavourites(
  workspaceId: string,
): Promise<Favourite[]> {
  const response = await apiClient.get("/favourites", {
    params: { workspaceId },
  });

  return response.data.data;
}

/**
 * Add a note or notebook to favourites.
 *
 * The backend accepts exactly:
 * { type: "note", id: "..." }
 * or
 * { type: "notebook", id: "..." }
 */
export async function addFavourite(
  target: FavouriteTarget,
): Promise<void> {
  await apiClient.post("/favourites", target);
}

/**
 * Remove a note or notebook from favourites.
 */
export async function removeFavourite(
  target: FavouriteTarget,
): Promise<void> {
  await apiClient.delete("/favourites", {
    data: target,
  });
}