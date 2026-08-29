import { prisma } from '../../config/prisma';

export const notebookService = {
  create: (ownerId: string, workspaceId: string, title: string) =>
    prisma.notebook.create({ data: { ownerId, workspaceId, title } }),

  findAllByWorkspace: (ownerId: string, workspaceId: string) =>
    prisma.notebook.findMany({
      where: { ownerId, workspaceId },
      orderBy: { updatedAt: 'desc' },
    }),

  remove: (id: string, ownerId: string) => prisma.notebook.deleteMany({ where: { id, ownerId } }),

  //rename service
  rename: async (id: string, ownerId: string, title: string) => {
    const result = await prisma.notebook.updateMany({
      where: { id, ownerId },
      data: { title },
    });
    if (result.count === 0) return null; // not found, or not owned by this user
    return prisma.notebook.findUnique({ where: { id } });
  },
};
