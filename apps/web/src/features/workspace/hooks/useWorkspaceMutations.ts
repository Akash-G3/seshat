import { useMutation } from "@tanstack/react-query";
import { renameWorkspace } from "../api/workspace.api";

/**
 * AuthContext owns the current workspace object, so this mutation does not
 * maintain a second workspace cache. The caller updates AuthContext from the
 * successful response.
 */
export function useRenameWorkspace() {
  return useMutation({
    mutationFn: (name: string) => renameWorkspace(name),
  });
}
