import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNotebook, renameNotebook, deleteNotebook } from "../api/notebook.api";

// All three notebook mutations in one file since they share the same
// invalidation target (the notebooks list) and are always used together in the sidebar.

export function useCreateNotebook(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, parentId }: { title: string; parentId: string | null }) =>
      createNotebook(workspaceId, title, parentId),
    // Create needs a real server-generated ID before it's usable (clickable, routable),
    // so we don't fake an optimistic entry — just refetch once the real one exists.
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
      const previous = queryClient.getQueryData(key);

      // Optimistically rename in the cached list immediately —
      // this is why the sidebar updates instantly instead of waiting on the network.
      queryClient.setQueryData(key, (old: any) =>
        old?.map((nb: any) => (nb.id === id ? { ...nb, title } : nb))
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      // Roll back if the server rejects the rename
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
      const previous = queryClient.getQueryData(notebooksKey);

      queryClient.setQueryData(notebooksKey, (old: any) => old?.filter((nb: any) => nb.id !== id));

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(notebooksKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notebooksKey });
      // Notes that were inside the deleted notebook need refetching too —
      // depending on your backend's delete behavior (cascade delete vs orphan-to-unfiled),
      // this keeps the note list honest either way.
      queryClient.invalidateQueries({ queryKey: notesKey });
    },
  });
}