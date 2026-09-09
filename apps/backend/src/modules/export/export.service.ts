import { prisma } from '../../config/prisma';
import { NotFoundError } from '../../shared/errors/errors';
import { blockNoteToMarkdown } from '../../shared/utils/documentText';

const copyTitle = (title: string) => `${title} (copy)`;

export const exportService = {
  copyNote: async (
    noteId: string,
    ownerId: string,
    input: { notebookId?: string | null; title?: string }
  ) => {
    const source = await prisma.note.findFirst({
      where: { id: noteId, ownerId, deletedAt: null },
      include: { document: true, tags: true },
    });
    if (!source) throw new NotFoundError('Note not found');

    if (input.notebookId) {
      const destination = await prisma.notebook.findFirst({
        where: {
          id: input.notebookId,
          ownerId,
          workspaceId: source.workspaceId,
          deletedAt: null,
        },
      });
      if (!destination) throw new NotFoundError('Destination notebook not found');
    }

    return prisma.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: {
          ownerId,
          content: source.document.content,
          searchText: source.document.searchText,
        },
      });
      const note = await tx.note.create({
        data: {
          ownerId,
          workspaceId: source.workspaceId,
          notebookId: input.notebookId === undefined ? source.notebookId : input.notebookId,
          title: input.title ?? copyTitle(source.title),
          documentId: document.id,
        },
      });
      if (source.tags.length) {
        await tx.noteTag.createMany({
          data: source.tags.map((row) => ({ noteId: note.id, tagId: row.tagId })),
          skipDuplicates: true,
        });
      }
      return note;
    });
  },

  copyNotebook: async (
    notebookId: string,
    ownerId: string,
    input: { parentId?: string | null; title?: string }
  ) => {
    const source = await prisma.notebook.findFirst({
      where: { id: notebookId, ownerId, deletedAt: null },
    });
    if (!source) throw new NotFoundError('Notebook not found');

    const allNotebooks = await prisma.notebook.findMany({
      where: { ownerId, workspaceId: source.workspaceId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
    const descendants = new Set<string>([source.id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const notebook of allNotebooks) {
        if (notebook.parentId && descendants.has(notebook.parentId) && !descendants.has(notebook.id)) {
          descendants.add(notebook.id);
          changed = true;
        }
      }
    }

    const sourceNotebooks = allNotebooks.filter((n) => descendants.has(n.id));
    const sourceNotes = await prisma.note.findMany({
      where: { ownerId, notebookId: { in: [...descendants] }, deletedAt: null },
      include: { document: true, tags: true },
      orderBy: { createdAt: 'asc' },
    });

    return prisma.$transaction(async (tx) => {
      const idMap = new Map<string, string>();
      let rootCopyId = '';

      const pending = [...sourceNotebooks];
      while (pending.length) {
        const index = pending.findIndex(
          (n) => n.id === source.id || !n.parentId || idMap.has(n.parentId)
        );
        if (index === -1) throw new Error('Notebook tree could not be copied');
        const [current] = pending.splice(index, 1);
        const isRoot = current.id === source.id;
        const created = await tx.notebook.create({
          data: {
            ownerId,
            workspaceId: source.workspaceId,
            parentId: isRoot
              ? input.parentId === undefined
                ? source.parentId
                : input.parentId
              : current.parentId
                ? idMap.get(current.parentId) ?? null
                : null,
            title: isRoot ? input.title ?? copyTitle(current.title) : current.title,
          },
        });
        idMap.set(current.id, created.id);
        if (isRoot) rootCopyId = created.id;
      }

      for (const sourceNote of sourceNotes) {
        const document = await tx.document.create({
          data: {
            ownerId,
            content: sourceNote.document.content,
            searchText: sourceNote.document.searchText,
          },
        });
        const note = await tx.note.create({
          data: {
            ownerId,
            workspaceId: source.workspaceId,
            notebookId: sourceNote.notebookId ? idMap.get(sourceNote.notebookId) ?? null : null,
            title: sourceNote.title,
            documentId: document.id,
          },
        });
        if (sourceNote.tags.length) {
          await tx.noteTag.createMany({
            data: sourceNote.tags.map((row) => ({ noteId: note.id, tagId: row.tagId })),
            skipDuplicates: true,
          });
        }
      }

      return tx.notebook.findUnique({ where: { id: rootCopyId } });
    });
  },

  exportNote: async (noteId: string, ownerId: string) => {
    const note = await prisma.note.findFirst({
      where: { id: noteId, ownerId, deletedAt: null },
      include: {
        document: { select: { content: true } },
        tags: { include: { tag: { select: { name: true } } } },
      },
    });
    if (!note) throw new NotFoundError('Note not found');

    return {
      json: {
        version: 1,
        exportedAt: new Date().toISOString(),
        note: {
          id: note.id,
          title: note.title,
          workspaceId: note.workspaceId,
          notebookId: note.notebookId,
          tags: note.tags.map((row) => row.tag.name),
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          content: note.document.content,
        },
      },
      markdown: `# ${note.title}\n\n${blockNoteToMarkdown(note.document.content)}\n`,
    };
  },
};
