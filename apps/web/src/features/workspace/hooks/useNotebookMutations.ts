import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNotebook, renameNotebook, deleteNotebook } from "../api/notebook.api";
import type { Notebook } from "../types/workspace.types";

export function useCreateNotebook(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ title, parentId }: { title: string; parentId: string | null }) =>
      createNotebook(workspaceId, title, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebooks", workspaceId] });
    },
  });
}

export function useRenameNotebook(workspaceId: string) {
  const queryClient = useQueryClient();
  const key = ["notebooks", workspaceId];

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => renameNotebook(id, title),

    onMutate: async ({ id, title }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Notebook[]>(key);

      queryClient.setQueryData<Notebook[]>(key, (old) =>
        old?.map((notebook) =>
          notebook.id === id ? { ...notebook, title } : notebook,
        ),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteNotebook(workspaceId: string) {
  const queryClient = useQueryClient();
  const notebooksKey = ["notebooks", workspaceId];
  const notesKey = ["notes"];

  return useMutation({
    mutationFn: (id: string) => deleteNotebook(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notebooksKey });
      const previous = queryClient.getQueryData<Notebook[]>(notebooksKey);

      queryClient.setQueryData<Notebook[]>(notebooksKey, (old) =>
        old?.filter((notebook) => notebook.id !== id),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(notebooksKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notebooksKey });
      // Keep notes in sync because deleting a notebook can change their
      // notebook relationship depending on the backend's delete semantics.
      queryClient.invalidateQueries({ queryKey: notesKey });
    },
  });
}
