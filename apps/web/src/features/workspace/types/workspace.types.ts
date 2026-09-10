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
  title: string;
  workspaceId: string;
  parentId: string | null;
}

export interface Note extends NoteSummary {
  document: { content: object }; // BlockNote JSON — nested under `document`, matching the Prisma include in note.service.ts
  workspaceId: string;
}

// Client-side assembled shape — not what any single endpoint returns
export interface NotebookNode extends Notebook {
  notes: NoteSummary[];
  children: NotebookNode[];
}

export interface WorkspaceTree {
  notebooks: NotebookNode[];
  unfiledNotes: NoteSummary[];
}