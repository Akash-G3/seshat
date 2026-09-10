export interface TrashItem {
  type: "note" | "notebook";
  id: string;
  title: string;
  notebookId?: string | null;
  parentId?: string | null;
  workspaceId: string;
  deletedAt: string;
  updatedAt: string;
}
