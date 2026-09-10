export interface Tag {
  id: string;
  ownerId: string;
  workspaceId: string;
  name: string;
  _count?: { notes: number };
}

export type NoteTag = Tag;
