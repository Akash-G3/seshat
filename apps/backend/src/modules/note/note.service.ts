// note.service.ts
import { prisma } from "../../config/prisma";
import { documentService } from "../document/document.service";
import { CreateNoteInput, UpdateNoteInput } from "./note.types";

export const noteService = {
  create: async ({ workspaceId, notebookId, ownerId, title, content }: CreateNoteInput) => {
    const document = await documentService.create(ownerId, content ?? {});
    return prisma.note.create({
      data: { workspaceId, notebookId, ownerId, title, documentId: document.id },
    });
  },

  findAllByOwner: (ownerId: string) =>
    prisma.note.findMany({
      where: { ownerId },
      select: { id: true, title: true, notebookId: true, workspaceId: true, updatedAt: true, createdAt: true },
      orderBy: { updatedAt: "desc" },
    }),

  findById: (id: string, ownerId: string) =>
    prisma.note.findFirst({
      where: { id, ownerId },
      include: { document: { select: { content: true } } },
    }),

  update: async (id: string, ownerId: string, { title, content, notebookId }: UpdateNoteInput) => {
    const note = await prisma.note.findFirst({ where: { id, ownerId } });
    if (!note) return null;

    if (content !== undefined) {
      await documentService.update(note.documentId, content);
    }
    if (title !== undefined || notebookId !== undefined) {
      await prisma.note.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(notebookId !== undefined && { notebookId }),
        },
      });
    }
    return noteService.findById(id, ownerId);
  },

  remove: (id: string, ownerId: string) =>
    prisma.note.deleteMany({ where: { id, ownerId } }),
};