import { useMutation, useQueryClient } from "@tanstack/react-query";
import { copyNote, copyNotebook, exportNote } from "../api/export.api";

export function useExportNote() {
  return useMutation({
    mutationFn: ({ noteId, format }: { noteId: string; format: "md" | "json" }) =>
      exportNote(noteId, format),
  });
}

export function useCopyNote(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: copyNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["notebooks", workspaceId] });
    },
  });
}

export function useCopyNotebook(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: copyNotebook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notebooks", workspaceId] }),
  });
}
