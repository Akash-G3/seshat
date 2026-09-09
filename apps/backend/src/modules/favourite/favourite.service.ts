import { prisma } from '../../config/prisma';
import { NotFoundError } from '../../shared/errors/errors';

export type FavouriteTarget = { type: 'note' | 'notebook'; id: string };

export const favouriteService = {
  add: async (ownerId: string, target: FavouriteTarget) => {
    if (target.type === 'note') {
      const note = await prisma.note.findFirst({ where: { id: target.id, ownerId, deletedAt: null } });
      if (!note) throw new NotFoundError('Note not found');
      return prisma.favourite.upsert({
        where: { ownerId_noteId: { ownerId, noteId: target.id } },
        create: { ownerId, noteId: target.id },
        update: {},
      });
    }

    const notebook = await prisma.notebook.findFirst({
      where: { id: target.id, ownerId, deletedAt: null },
    });
    if (!notebook) throw new NotFoundError('Notebook not found');
    return prisma.favourite.upsert({
      where: { ownerId_notebookId: { ownerId, notebookId: target.id } },
      create: { ownerId, notebookId: target.id },
      update: {},
    });
  },

  remove: async (ownerId: string, target: FavouriteTarget) => {
    const result = await prisma.favourite.deleteMany({
      where: {
        ownerId,
        ...(target.type === 'note' ? { noteId: target.id } : { notebookId: target.id }),
      },
    });
    if (!result.count) throw new NotFoundError('Favourite not found');
  },

  list: async (ownerId: string, workspaceId?: string) => {
    const rows = await prisma.favourite.findMany({
      where: {
        ownerId,
        OR: [
          { note: { is: { ...(workspaceId ? { workspaceId } : {}), deletedAt: null } } },
          { notebook: { is: { ...(workspaceId ? { workspaceId } : {}), deletedAt: null } } },
        ],
      },
      include: {
        note: { select: { id: true, title: true, notebookId: true, workspaceId: true, updatedAt: true } },
        notebook: {
          select: { id: true, title: true, parentId: true, workspaceId: true, updatedAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) =>
      row.note
        ? { type: 'note' as const, favouritedAt: row.createdAt, ...row.note }
        : { type: 'notebook' as const, favouritedAt: row.createdAt, ...row.notebook! }
    );
  },
};
