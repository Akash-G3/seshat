import crypto from 'node:crypto';
import { prisma } from '../../config/prisma';

export class DuplicateNotebookTitleError extends Error {
  constructor() {
    super('A notebook with this name already exists here');
    this.name = 'DuplicateNotebookTitleError';
  }
}

type NotebookRow = NonNullable<Awaited<ReturnType<typeof prisma.notebook.findFirst>>>;

export const notebookService = {
  create: async (
    ownerId: string,
    workspaceId: string,
    title: string,
    parentId: string | null = null
  ) => {
    // Duplicate check is scoped to the same workspace + same parent (i.e. same
    // "folder level") — so "Recipes" can exist once at the workspace root and
    // once again inside another notebook without conflicting.
    const existing = await prisma.notebook.findFirst({
      where: {
        ownerId,
        workspaceId,
        parentId,
        deletedAt: null,
        title: { equals: title, mode: 'insensitive' },
      },
    });
    if (existing) throw new DuplicateNotebookTitleError();

    if (parentId) {
      const parent = await prisma.notebook.findFirst({
        where: { id: parentId, ownerId, workspaceId, deletedAt: null },
      });
      if (!parent) throw new Error('Parent notebook not found');
    }

    return prisma.notebook.create({ data: { ownerId, workspaceId, title, parentId } });
  },

  // Flat list — still useful for simple views / search. Excludes trashed notebooks.
  findAllByWorkspace: (ownerId: string, workspaceId: string) =>
    prisma.notebook.findMany({
      where: { ownerId, workspaceId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    }),

  // Same data, shaped into a parent -> children tree in memory.
  // One query for the whole workspace; fine at this scale, avoids N+1 recursion.
  findTreeByWorkspace: async (ownerId: string, workspaceId: string) => {
    const notebooks = await prisma.notebook.findMany({
      where: { ownerId, workspaceId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });

    type NodeWithChildren = NotebookRow & { children: NodeWithChildren[] };
    const byId = new Map<string, NodeWithChildren>(
      notebooks.map((n) => [n.id, { ...n, children: [] }])
    );
    const roots: NodeWithChildren[] = [];

    for (const node of byId.values()) {
      if (node.parentId && byId.has(node.parentId)) {
        byId.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  },

  rename: async (id: string, ownerId: string, title: string) => {
    const notebook = await prisma.notebook.findFirst({ where: { id, ownerId, deletedAt: null } });
    if (!notebook) return null;

    const duplicate = await prisma.notebook.findFirst({
      where: {
        id: { not: id },
        ownerId,
        workspaceId: notebook.workspaceId,
        parentId: notebook.parentId,
        deletedAt: null,
        title: { equals: title, mode: 'insensitive' },
      },
    });
    if (duplicate) throw new DuplicateNotebookTitleError();

    return prisma.notebook.update({ where: { id }, data: { title } });
  },

  // Move a notebook under a new parent (or to the workspace root if newParentId is null).
  move: async (id: string, ownerId: string, newParentId: string | null) => {
    const notebook = await prisma.notebook.findFirst({ where: { id, ownerId, deletedAt: null } });
    if (!notebook) return null;

    if (newParentId) {
      if (newParentId === id) throw new Error('A notebook cannot be its own parent');

      const newParent = await prisma.notebook.findFirst({
        where: { id: newParentId, ownerId, workspaceId: notebook.workspaceId, deletedAt: null },
      });
      if (!newParent) throw new Error('Target parent notebook not found');

      // Walk up from the target parent to the root, making sure `id` never
      // appears — otherwise we'd create a cycle (a notebook inside itself).
      let cursor: string | null = newParentId;
      while (cursor) {
        if (cursor === id) throw new Error('Cannot move a notebook into its own descendant');
        const step: { parentId: string | null } | null = await prisma.notebook.findUnique({
          where: { id: cursor },
          select: { parentId: true },
        });
        cursor = step?.parentId ?? null;
      }
    }

    const duplicate = await prisma.notebook.findFirst({
      where: {
        id: { not: id },
        ownerId,
        workspaceId: notebook.workspaceId,
        parentId: newParentId,
        deletedAt: null,
        title: { equals: notebook.title, mode: 'insensitive' },
      },
    });
    if (duplicate) throw new DuplicateNotebookTitleError();

    return prisma.notebook.update({ where: { id }, data: { parentId: newParentId } });
  },

  // DELETE now means "move to trash" (whole subtree), not "promote children and delete".
  // Permanent deletion lives in /api/trash. One deleteBatchId is stamped across the
  // notebook subtree plus its currently-active notes, so a later restore only revives
  // exactly what this delete touched — notes trashed earlier, separately, are untouched.
  remove: async (id: string, ownerId: string) => {
    const root = await prisma.notebook.findFirst({ where: { id, ownerId, deletedAt: null } });
    if (!root) return false;

    const all = await prisma.notebook.findMany({
      where: { ownerId, workspaceId: root.workspaceId, deletedAt: null },
      select: { id: true, parentId: true },
    });
    const ids = new Set<string>([id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const row of all) {
        if (row.parentId && ids.has(row.parentId) && !ids.has(row.id)) {
          ids.add(row.id);
          changed = true;
        }
      }
    }

    const deletedAt = new Date();
    const deleteBatchId = crypto.randomUUID();
    await prisma.$transaction([
      prisma.notebook.updateMany({
        where: { id: { in: [...ids] }, ownerId },
        data: { deletedAt, deleteBatchId },
      }),
      prisma.note.updateMany({
        where: { notebookId: { in: [...ids] }, ownerId, deletedAt: null },
        data: { deletedAt, deleteBatchId },
      }),
    ]);
    return true;
  },
};
