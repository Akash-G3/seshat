import crypto from 'node:crypto';
import { prisma } from '../../config/prisma';
import { NotFoundError } from '../../shared/errors/errors';

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export const shareService = {
  create: async (
    ownerId: string,
    input: { type: 'note' | 'notebook'; id: string; expiresAt?: Date }
  ) => {
    if (input.type === 'note') {
      const note = await prisma.note.findFirst({ where: { id: input.id, ownerId, deletedAt: null } });
      if (!note) throw new NotFoundError('Note not found');
    } else {
      const notebook = await prisma.notebook.findFirst({
        where: { id: input.id, ownerId, deletedAt: null },
      });
      if (!notebook) throw new NotFoundError('Notebook not found');
    }

    const token = crypto.randomBytes(32).toString('base64url');
    const tokenHash = hashToken(token);
    const share = await prisma.shareLink.create({
      data: {
        ownerId,
        tokenHash,
        expiresAt: input.expiresAt,
        ...(input.type === 'note' ? { noteId: input.id } : { notebookId: input.id }),
      },
      select: { id: true, expiresAt: true, createdAt: true },
    });

    return { ...share, token };
  },

  list: (ownerId: string) =>
    prisma.shareLink.findMany({
      where: { ownerId, revokedAt: null },
      select: {
        id: true,
        noteId: true,
        notebookId: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),

  revoke: async (id: string, ownerId: string) => {
    const result = await prisma.shareLink.updateMany({
      where: { id, ownerId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (!result.count) throw new NotFoundError('Share link not found');
  },

  resolvePublic: async (token: string) => {
    const link = await prisma.shareLink.findUnique({
      where: { tokenHash: hashToken(token) },
      include: {
        note: { include: { document: { select: { content: true } }, tags: { include: { tag: true } } } },
        notebook: true,
      },
    });

    if (!link || link.revokedAt || (link.expiresAt && link.expiresAt <= new Date())) {
      throw new NotFoundError('Share link not found or expired');
    }
    if (link.note?.deletedAt || link.notebook?.deletedAt) throw new NotFoundError('Shared item unavailable');

    if (link.note) {
      return {
        type: 'note' as const,
        id: link.note.id,
        title: link.note.title,
        content: link.note.document.content,
        tags: link.note.tags.map((row) => row.tag.name),
        updatedAt: link.note.updatedAt,
      };
    }

    const root = link.notebook!;
    const allNotebooks = await prisma.notebook.findMany({
      where: { ownerId: link.ownerId, workspaceId: root.workspaceId, deletedAt: null },
      select: { id: true, title: true, parentId: true, updatedAt: true },
    });
    const ids = new Set<string>([root.id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const notebook of allNotebooks) {
        if (notebook.parentId && ids.has(notebook.parentId) && !ids.has(notebook.id)) {
          ids.add(notebook.id);
          changed = true;
        }
      }
    }

    const notes = await prisma.note.findMany({
      where: { ownerId: link.ownerId, notebookId: { in: [...ids] }, deletedAt: null },
      select: {
        id: true,
        title: true,
        notebookId: true,
        updatedAt: true,
        document: { select: { content: true } },
        tags: { select: { tag: { select: { name: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      type: 'notebook' as const,
      id: root.id,
      title: root.title,
      updatedAt: root.updatedAt,
      notebooks: allNotebooks.filter((notebook) => ids.has(notebook.id)),
      notes: notes.map((note) => ({
        id: note.id,
        title: note.title,
        notebookId: note.notebookId,
        updatedAt: note.updatedAt,
        content: note.document.content,
        tags: note.tags.map((row) => row.tag.name),
      })),
    };
  },
};
