export interface OpenTab {
  noteId: string;
  title: string;
  notebookId: string | null;
}

export interface BreadcrumbSegment {
  id: string;
  label: string;
  type: "workspace" | "notebook" | "note";
}