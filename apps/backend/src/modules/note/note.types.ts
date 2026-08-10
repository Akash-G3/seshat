// note.types.ts
export interface CreateNoteInput {
  workspaceId: string;
  notebookId?: string;
  ownerId: string;
  title: string;
  content?: object;
}

export interface UpdateNoteInput {
  title?: string;
  content?: object;
  notebookId?: string | null;
}