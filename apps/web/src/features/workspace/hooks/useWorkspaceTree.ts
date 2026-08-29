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
    tree = {
      notebooks: notebooksQuery.data.map((nb) => ({
        ...nb,
        notes: notes.filter((n) => n.notebookId === nb.id),
      })),
      unfiledNotes: notes.filter((n) => n.notebookId === null),
    };
  }

  return { workspace: workspaceQuery.data, tree, isLoading, isError };
}