import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useAuth } from "@app/AuthContext";
import { getNotebooks } from "../api/notebook.api";
import { getNotes } from "../api/note.api";
import type { NotebookNode, WorkspaceTree } from "../types/workspace.types";

export function useWorkspaceTree() {
  const { workspace } = useAuth();
  const workspaceId = workspace?.id;

  const [notebooksQuery, notesQuery] = useQueries({
    queries: [
      {
        queryKey: ["notebooks", workspaceId],
        queryFn: () => getNotebooks(workspaceId!),
        enabled: !!workspaceId,
      },
      {
        queryKey: ["notes"],
        queryFn: getNotes,
        enabled: !!workspaceId,
      },
    ],
  });

  const tree = useMemo<WorkspaceTree | undefined>(() => {
    const notes = notesQuery.data;
    const notebooks = notebooksQuery.data;

    if (!notes || !notebooks) return undefined;

    // Index notes once instead of filtering the complete note list
    // for every notebook. This keeps tree construction close to O(N).
    const notesByNotebook = new Map<string | null, typeof notes>();

    for (const note of notes) {
      const bucket = notesByNotebook.get(note.notebookId);
      if (bucket) bucket.push(note);
      else notesByNotebook.set(note.notebookId, [note]);
    }

    const nodes = new Map(
      notebooks.map((notebook) => [
        notebook.id,
        {
          ...notebook,
          notes: notesByNotebook.get(notebook.id) ?? [],
          children: [],
        },
      ]),
    );

    const roots: NotebookNode[] = [];

    for (const notebook of notebooks) {
      const node = nodes.get(notebook.id)!;

      if (notebook.parentId) {
        const parent = nodes.get(notebook.parentId);
        if (parent) parent.children.push(node);
        else roots.push(node);
      } else {
        roots.push(node);
      }
    }

    return {
      notebooks: roots,
      unfiledNotes: notesByNotebook.get(null) ?? [],
    };
  }, [notebooksQuery.data, notesQuery.data]);

  return {
    workspace,
    tree,
    isLoading: notebooksQuery.isLoading || notesQuery.isLoading,
    isError: notebooksQuery.isError || notesQuery.isError,
  };
}
