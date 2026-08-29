import { prisma } from '../../config/prisma';

export const notebookService = {
  create: (ownerId: string, workspaceId: string, title: string) =>
    prisma.notebook.create({ data: { ownerId, workspaceId, title } }),

  findAllByWorkspace: (ownerId: string, workspaceId: string) =>
    prisma.notebook.findMany({
      where: { ownerId, workspaceId },
      orderBy: { updatedAt: 'desc' },
    }),

  rename: async (id: string, ownerId: string, title: string) => {
    const result = await prisma.notebook.updateMany({
      where: { id, ownerId },
      data: { title },
    });
    if (result.count === 0) return null; // not found, or not owned by this user
    return prisma.notebook.findUnique({ where: { id } });
  },

  remove: async (id: string, ownerId: string) => {
    // Wrapped in a transaction: if either step fails, both roll back —
    // we never want a state where notes got orphaned but the notebook still exists, or vice versa.
    return prisma.$transaction(async (tx) => {
      // 1. Move this notebook's notes to unfiled (clear notebookId).
      await tx.note.updateMany({
        where: { notebookId: id, ownerId },
        data: { notebookId: null },
      });

      // 2. Now delete the notebook itself.
      const result = await tx.notebook.deleteMany({ where: { id, ownerId } });

      return result.count > 0;
    });
  },
};