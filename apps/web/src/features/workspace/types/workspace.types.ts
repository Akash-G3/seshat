export interface Workspace {
  id: string;
  name: string;
}

export interface NoteSummary {
  id: string;
  title: string;
  notebookId: string | null;
  updatedAt: string;
}

export interface Notebook {
  id: string;
  title: string;   // was `name` — wrong
  workspaceId: string;
}

export interface Note extends NoteSummary {
  document: { content: object }; // BlockNote JSON — nested under `document`, matching the Prisma include in note.service.ts
  workspaceId: string;
}

// Client-side assembled shape — not what any single endpoint returns
export interface WorkspaceTree {
  notebooks: (Notebook & { notes: NoteSummary[] })[];
  unfiledNotes: NoteSummary[];
}