import { useQuery } from "@tanstack/react-query";
import { getNote } from "@features/workspace/api/note.api";

// Query key matches what useUpdateNote already invalidates (["note", noteId]),
// so a successful autosave keeps this in sync automatically.
export function useNote(noteId: string | undefined) {
  return useQuery({
    queryKey: ["note", noteId],
    queryFn: () => getNote(noteId!),
    enabled: !!noteId,
  });
}