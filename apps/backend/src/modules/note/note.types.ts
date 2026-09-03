import { Prisma } from '@prisma/client';

export interface CreateNoteInput {
  workspaceId: string;
  notebookId?: string;
  ownerId: string;
  title: string;
  content?: Prisma.InputJsonValue;
}

export interface UpdateNoteInput {
  title?: string;
  content?: Prisma.InputJsonValue;
  notebookId?: string | null;
}