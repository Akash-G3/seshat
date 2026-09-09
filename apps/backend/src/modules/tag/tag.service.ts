import { prisma } from '../../config/prisma';
import { ConflictError, NotFoundError } from '../../shared/errors/errors';

export const tagService = {
  create: async (ownerId: string, workspaceId: string, name: string) => {
    const existing = await prisma.tag.findFirst({
      where: { ownerId, workspaceId, name: { equals: name, mode: 'insensitive' } },
    });
    if (existing) throw new ConflictError('A tag with this name already exists');

    return prisma.tag.create({ data: { ownerId, workspaceId, name } });
  },

  list: (ownerId: string, workspaceId?: string) =>
    prisma.tag.findMany({
      where: { ownerId, ...(workspaceId ? { workspaceId } : {}) },
      include: { _count: { select: { notes: true } } },
      orderBy: [{ name: 'asc' }],
    }),

  rename: async (id: string, ownerId: string, name: string) => {
    const tag = await prisma.tag.findFirst({ where: { id, ownerId } });
    if (!tag) throw new NotFoundError('Tag not found');

    const duplicate = await prisma.tag.findFirst({
      where: {
        id: { not: id },
        ownerId,
        workspaceId: tag.workspaceId,
        name: { equals: name, mode: 'insensitive' },
      },
    });
    if (duplicate) throw new ConflictError('A tag with this name already exists');

    return prisma.tag.update({ where: { id }, data: { name } });
  },

  remove: async (id: string, ownerId: string) => {
    const result = await prisma.tag.deleteMany({ where: { id, ownerId } });
    if (!result.count) throw new NotFoundError('Tag not found');
  },

  attachToNote: async (noteId: string, tagId: string, ownerId: string) => {
    const [note, tag] = await Promise.all([
      prisma.note.findFirst({ where: { id: noteId, ownerId, deletedAt: null } }),
      prisma.tag.findFirst({ where: { id: tagId, ownerId } }),
    ]);
    if (!note) throw new NotFoundError('Note not found');
    if (!tag) throw new NotFoundError('Tag not found');
    if (note.workspaceId !== tag.workspaceId) {
      throw new ConflictError('Tag and note must belong to the same workspace');
    }

    return prisma.noteTag.upsert({
      where: { noteId_tagId: { noteId, tagId } },
      create: { noteId, tagId },
      update: {},
      include: { tag: true },
    });
  },

  detachFromNote: async (noteId: string, tagId: string, ownerId: string) => {
    const note = await prisma.note.findFirst({ where: { id: noteId, ownerId } });
    if (!note) throw new NotFoundError('Note not found');
    await prisma.noteTag.deleteMany({ where: { noteId, tagId } });
  },

  listForNote: async (noteId: string, ownerId: string) => {
    const note = await prisma.note.findFirst({ where: { id: noteId, ownerId } });
    if (!note) throw new NotFoundError('Note not found');

    return prisma.noteTag.findMany({
      where: { noteId },
      select: { tag: true },
      orderBy: { tag: { name: 'asc' } },
    });
  },
};
