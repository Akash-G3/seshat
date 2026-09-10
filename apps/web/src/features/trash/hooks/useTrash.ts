import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  emptyTrash,
  getTrash,
  moveToTrash,
  permanentlyDelete,
  restoreFromTrash,
} from "../api/trash.api";

export function useTrash(workspaceId: string) {
  return useQuery({
    queryKey: ["trash", workspaceId],
    queryFn: () => getTrash(workspaceId),
    enabled: !!workspaceId,
  });
}

function invalidateWorkspace(queryClient: ReturnType<typeof useQueryClient>, workspaceId: string) {
  queryClient.invalidateQueries({ queryKey: ["trash", workspaceId] });
  queryClient.invalidateQueries({ queryKey: ["notes"] });
  queryClient.invalidateQueries({ queryKey: ["notebooks", workspaceId] });
  queryClient.invalidateQueries({ queryKey: ["favourites", workspaceId] });
  queryClient.invalidateQueries({ queryKey: ["tags", workspaceId] });
}

export function useMoveToTrash(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id }: { type: "note" | "notebook"; id: string }) => moveToTrash(type, id),
    onSuccess: () => invalidateWorkspace(queryClient, workspaceId),
  });
}

export function useRestoreFromTrash(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id }: { type: "note" | "notebook"; id: string }) =>
      restoreFromTrash(type, id),
    onSuccess: () => invalidateWorkspace(queryClient, workspaceId),
  });
}

export function usePermanentlyDelete(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id }: { type: "note" | "notebook"; id: string }) =>
      permanentlyDelete(type, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trash", workspaceId] }),
  });
}

export function useEmptyTrash(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: emptyTrash,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trash", workspaceId] }),
  });
}
