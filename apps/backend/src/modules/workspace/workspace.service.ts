import { prisma } from '../../config/prisma';

export const workspaceService = {
  create: (ownerId: string, name: string) => prisma.workspace.create({ data: { ownerId, name } }),

  findByOwner: (ownerId: string) => prisma.workspace.findUnique({ where: { ownerId } }),

  rename: (ownerId: string, name: string) =>
    prisma.workspace.update({ where: { ownerId }, data: { name } }),
};
