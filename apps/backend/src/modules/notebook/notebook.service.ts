import { prisma } from "../../config/prisma";

export const notebookService = {
  create: (ownerId: string, workspaceId: string, title: string) =>
    prisma.notebook.create({ data: { ownerId, workspaceId, title } }),

  findAllByWorkspace: (ownerId: string, workspaceId: string) =>
    prisma.notebook.findMany({
      where: { ownerId, workspaceId },
      orderBy: { updatedAt: "desc" },
    }),

  remove: (id: string, ownerId: string) =>
    prisma.notebook.deleteMany({ where: { id, ownerId } }),
};