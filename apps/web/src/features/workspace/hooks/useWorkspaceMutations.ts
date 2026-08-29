import { useMutation, useQueryClient } from "@tanstack/react-query";
import { renameWorkspace } from "../api/workspace.api";

export function useRenameWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => renameWorkspace(name),
    onSuccess: (updated) => {
      queryClient.setQueryData(["workspace"], updated);
    },
  });
}