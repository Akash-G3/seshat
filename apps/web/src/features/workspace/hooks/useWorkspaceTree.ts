import { useQueries, useQuery } from "@tanstack/react-query";
import { getMyWorkspace } from "../api/workspace.api";
import { getNotebooks } from "../api/notebook.api";
import { getNotes } from "../api/note.api";
import type { WorkspaceTree } from "../types/workspace.types";

export function useWorkspaceTree() {
  const workspaceQuery = useQuery({
    queryKey: ["workspace"],
    queryFn: getMyWorkspace,
  });

  const workspaceId = workspaceQuery.data?.id;

  const [notebooksQuery, notesQuery] = useQueries({
    queries: [
      {
        queryKey: ["notebooks", workspaceId],
        queryFn: () => getNotebooks(workspaceId!),
        enabled: !!workspaceId,
      },
      {
        queryKey: ["notes"],
        queryFn: getNotes, // no workspaceId needed — server scopes by user
      },
    ],
  });

  const isLoading = workspaceQuery.isLoading || notebooksQuery.isLoading || notesQuery.isLoading;
  const isError = workspaceQuery.isError || notebooksQuery.isError || notesQuery.isError;

  let tree: WorkspaceTree | undefined;
  if (notebooksQuery.data && notesQuery.data) {
    const notes = notesQuery.data;
    const notebooks = notebooksQuery.data;

    // The API returns notebooks as a flat collection with parentId.
    // Build the visual tree here so Library stays a pure rendering component.
    const nodes = new Map(
      notebooks.map((notebook) => [
        notebook.id,
        {
          ...notebook,
          notes: notes.filter((note) => note.notebookId === notebook.id),
          children: [],
        },
      ]),
    );

    const roots = [];
    for (const notebook of notebooks) {
      const node = nodes.get(notebook.id)!;
      if (notebook.parentId) {
        const parent = nodes.get(notebook.parentId);
        if (parent) parent.children.push(node);
        else roots.push(node); // Defensive fallback for stale/orphaned data.
      } else {
        roots.push(node);
      }
    }

    tree = {
      notebooks: roots,
      unfiledNotes: notes.filter((note) => note.notebookId === null),
    };
  }

  return { workspace: workspaceQuery.data, tree, isLoading, isError };
}