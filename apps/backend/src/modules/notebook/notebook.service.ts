// import { prisma } from '../../config/prisma';

// export const notebookService = {
//   create: (ownerId: string, workspaceId: string, title: string) =>
//     prisma.notebook.create({ data: { ownerId, workspaceId, title } }),

//   findAllByWorkspace: (ownerId: string, workspaceId: string) =>
//     prisma.notebook.findMany({
//       where: { ownerId, workspaceId },
//       orderBy: { updatedAt: 'desc' },
//     }),

//   rename: async (id: string, ownerId: string, title: string) => {
//     const result = await prisma.notebook.updateMany({
//       where: { id, ownerId },
//       data: { title },
//     });
//     if (result.count === 0) return null; // not found, or not owned by this user
//     return prisma.notebook.findUnique({ where: { id } });
//   },

//   remove: async (id: string, ownerId: string) => {
//     // Wrapped in a transaction: if either step fails, both roll back —
//     // we never want a state where notes got orphaned but the notebook still exists, or vice versa.
//     return prisma.$transaction(async (tx) => {
//       // 1. Move this notebook's notes to unfiled (clear notebookId).
//       await tx.note.updateMany({
//         where: { notebookId: id, ownerId },
//         data: { notebookId: null },
//       });

//       // 2. Now delete the notebook itself.
//       const result = await tx.notebook.deleteMany({ where: { id, ownerId } });

//       return result.count > 0;
//     });
//   },
// };

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
        title: { equals: title, mode: 'insensitive' },
      },
    });
    if (existing) throw new DuplicateNotebookTitleError();

    if (parentId) {
      const parent = await prisma.notebook.findFirst({
        where: { id: parentId, ownerId, workspaceId },
      });
      if (!parent) throw new Error('Parent notebook not found');
    }

    return prisma.notebook.create({ data: { ownerId, workspaceId, title, parentId } });
  },

  // Flat list (unchanged) — still useful for simple views / search.
  findAllByWorkspace: (ownerId: string, workspaceId: string) =>
    prisma.notebook.findMany({
      where: { ownerId, workspaceId },
      orderBy: { updatedAt: 'desc' },
    }),

  // Same data, shaped into a parent -> children tree in memory.
  // One query for the whole workspace; fine at this scale, avoids N+1 recursion.
  findTreeByWorkspace: async (ownerId: string, workspaceId: string) => {
    const notebooks = await prisma.notebook.findMany({
      where: { ownerId, workspaceId },
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
    const notebook = await prisma.notebook.findFirst({ where: { id, ownerId } });
    if (!notebook) return null;

    const duplicate = await prisma.notebook.findFirst({
      where: {
        id: { not: id },
        ownerId,
        workspaceId: notebook.workspaceId,
        parentId: notebook.parentId,
        title: { equals: title, mode: 'insensitive' },
      },
    });
    if (duplicate) throw new DuplicateNotebookTitleError();

    return prisma.notebook.update({ where: { id }, data: { title } });
  },

  // Move a notebook under a new parent (or to the workspace root if newParentId is null).
  move: async (id: string, ownerId: string, newParentId: string | null) => {
    const notebook = await prisma.notebook.findFirst({ where: { id, ownerId } });
    if (!notebook) return null;

    if (newParentId) {
      if (newParentId === id) throw new Error('A notebook cannot be its own parent');

      const newParent = await prisma.notebook.findFirst({
        where: { id: newParentId, ownerId, workspaceId: notebook.workspaceId },
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
        title: { equals: notebook.title, mode: 'insensitive' },
      },
    });
    if (duplicate) throw new DuplicateNotebookTitleError();

    return prisma.notebook.update({ where: { id }, data: { parentId: newParentId } });
  },

  remove: async (id: string, ownerId: string) => {
    // Wrapped in a transaction: if any step fails, everything rolls back.
    return prisma.$transaction(async (tx) => {
      const notebook = await tx.notebook.findFirst({ where: { id, ownerId } });
      if (!notebook) return false;

      // 1. Promote this notebook's children up one level (to its own parent),
      //    mirroring how notes get "unfiled" rather than deleted.
      await tx.notebook.updateMany({
        where: { parentId: id, ownerId },
        data: { parentId: notebook.parentId },
      });

      // 2. Move this notebook's notes to unfiled (clear notebookId).
      await tx.note.updateMany({
        where: { notebookId: id, ownerId },
        data: { notebookId: null },
      });

      // 3. Now delete the notebook itself.
      const result = await tx.notebook.deleteMany({ where: { id, ownerId } });

      return result.count > 0;
    });
  },
};