export type FavouriteType = "note" | "notebook";

export interface Favourite {
  id: string;
  title: string;
  type: FavouriteType;

  // Present for notes.
  notebookId?: string | null;

  // Present for notebooks.
  parentId?: string | null;

  updatedAt?: string;
}