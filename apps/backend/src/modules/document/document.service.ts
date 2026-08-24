import { prisma } from '../../config/prisma';

export const documentService = {
  create: (ownerId: string, content: object = {}) =>
    prisma.document.create({ data: { ownerId, content } }),

  update: (id: string, content: object) =>
    prisma.document.update({ where: { id }, data: { content } }),
};
