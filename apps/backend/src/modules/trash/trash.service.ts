import crypto from 'node:crypto';
import { prisma } from '../../config/prisma';
import { NotFoundError } from '../../shared/errors/errors';

export type TrashTarget = { type: 'note' | 'notebook'; id: string };

async function collectNotebookTreeIds(rootId: string, ownerId: string): Promise<string[]> {
  const all = await prisma.notebook.findMany({
    where: { ownerId },
    select: { id: true, parentId: true },
  });
  const children = new Map<string, string[]>();
  for (const row of all) {
    if (!row.parentId) continue;
    const list = children.get(row.parentId) ?? [];
    list.push(row.id);
    children.set(row.parentId, list);
  }

  const ids: string[] = [];
  const stack = [rootId];
  while (stack.length) {
    const current = stack.pop()!;
    ids.push(current);
    stack.push(...(children.get(current) ?? []));
  }
  return ids;
}

export const trashService = {
  list: async (ownerId: string, workspaceId?: string) => {
    const [notes, notebooks] = await Promise.all([
      prisma.note.findMany({
        where: { ownerId, deletedAt: { not: null }, ...(workspaceId ? { workspaceId } : {}) },
        select: {
          id: true,
          title: true,
          notebookId: true,
          workspaceId: true,
          deletedAt: true,
          updatedAt: true,
        },
        orderBy: { deletedAt: 'desc' },
      }),
      prisma.notebook.findMany({
        where: { ownerId, deletedAt: { not: null }, ...(workspaceId ? { workspaceId } : {}) },
        select: {
          id: true,
          title: true,
          parentId: true,
          workspaceId: true,
          deletedAt: true,
          updatedAt: true,
        },
        orderBy: { deletedAt: 'desc' },
      }),
    ]);

    return [
      ...notes.map((item) => ({ type: 'note' as const, ...item })),
      ...notebooks.map((item) => ({ type: 'notebook' as const, ...item })),
    ].sort((a, b) => (b.deletedAt?.getTime() ?? 0) - (a.deletedAt?.getTime() ?? 0));
  },

  moveToTrash: async (ownerId: string, target: TrashTarget) => {
    const now = new Date();
    const deleteBatchId = crypto.randomUUID();

    if (target.type === 'note') {
      const result = await prisma.note.updateMany({
        where: { id: target.id, ownerId, deletedAt: null },
        data: { deletedAt: now, deleteBatchId },
      });
      if (!result.count) throw new NotFoundError('Note not found');
      return;
    }

    const root = await prisma.notebook.findFirst({ where: { id: target.id, ownerId } });
    if (!root) throw new NotFoundError('Notebook not found');
    const ids = await collectNotebookTreeIds(target.id, ownerId);

    await prisma.$transaction([
      prisma.notebook.updateMany({
        where: { id: { in: ids }, ownerId, deletedAt: null },
        data: { deletedAt: now, deleteBatchId },
      }),
      prisma.note.updateMany({
        where: { notebookId: { in: ids }, ownerId, deletedAt: null },
        data: { deletedAt: now, deleteBatchId },
      }),
    ]);
  },

  restore: async (ownerId: string, target: TrashTarget) => {
    if (target.type === 'note') {
      const result = await prisma.note.updateMany({
        where: { id: target.id, ownerId, deletedAt: { not: null } },
        data: { deletedAt: null, deleteBatchId: null },
      });
      if (!result.count) throw new NotFoundError('Trashed note not found');
      return;
    }

    const root = await prisma.notebook.findFirst({ where: { id: target.id, ownerId } });
    if (!root || !root.deleteBatchId) throw new NotFoundError('Trashed notebook not found');
    const ids = await collectNotebookTreeIds(target.id, ownerId);
    const batchId = root.deleteBatchId;

    await prisma.$transaction([
      prisma.notebook.updateMany({
        where: { id: { in: ids }, ownerId, deleteBatchId: batchId },
        data: { deletedAt: null, deleteBatchId: null },
      }),
      prisma.note.updateMany({
        where: { notebookId: { in: ids }, ownerId, deleteBatchId: batchId },
        data: { deletedAt: null, deleteBatchId: null },
      }),
    ]);
  },

  deletePermanently: async (ownerId: string, target: TrashTarget) => {
    if (target.type === 'note') {
      const note = await prisma.note.findFirst({
        where: { id: target.id, ownerId, deletedAt: { not: null } },
        select: { id: true, documentId: true },
      });
      if (!note) throw new NotFoundError('Trashed note not found');

      await prisma.$transaction(async (tx) => {
        await tx.note.delete({ where: { id: note.id } });
        await tx.document.deleteMany({ where: { id: note.documentId, ownerId } });
      });
      return;
    }

    const root = await prisma.notebook.findFirst({
      where: { id: target.id, ownerId, deletedAt: { not: null } },
    });
    if (!root) throw new NotFoundError('Trashed notebook not found');
    const ids = await collectNotebookTreeIds(target.id, ownerId);

    await prisma.$transaction(async (tx) => {
      const notes = await tx.note.findMany({
        where: { notebookId: { in: ids }, ownerId },
        select: { documentId: true },
      });
      await tx.note.deleteMany({ where: { notebookId: { in: ids }, ownerId } });
      await tx.notebook.deleteMany({ where: { id: { in: ids }, ownerId } });
      await tx.document.deleteMany({
        where: { id: { in: notes.map((note) => note.documentId) }, ownerId },
      });
    });
  },

  empty: async (ownerId: string) => {
    const trashedNotes = await prisma.note.findMany({
      where: { ownerId, deletedAt: { not: null } },
      select: { documentId: true },
    });
    await prisma.$transaction(async (tx) => {
      await tx.note.deleteMany({ where: { ownerId, deletedAt: { not: null } } });
      await tx.notebook.deleteMany({ where: { ownerId, deletedAt: { not: null } } });
      await tx.document.deleteMany({
        where: { id: { in: trashedNotes.map((n) => n.documentId) }, ownerId },
      });
    });
  },
};
