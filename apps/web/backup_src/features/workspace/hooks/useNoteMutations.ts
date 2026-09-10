import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote, deleteNote, updateNote } from "../api/note.api";

export function useCreateNote(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ notebookId, title }: { notebookId: string | null; title: string }) => {
      const payload = {
        workspaceId,
        title: title.trim() || "Untitled", // fallback only if left blank
        ...(notebookId ? { notebookId } : {}),
      };
      return createNote(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    // onError: (error) => {
    //   console.error("Failed to create note:", error);
    // },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  const notesKey = ["notes"];

  return useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notesKey });
      const previous = queryClient.getQueryData(notesKey);
      queryClient.setQueryData(notesKey, (old: any) => old?.filter((n: any) => n.id !== id));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(notesKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notesKey }),
  });
}

// Used for both the editor's autosave AND inline note-title renaming in the sidebar
export function useUpdateNote(noteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title?: string; content?: object }) => updateNote(noteId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note", noteId] });
    },
    onError: (error) => {
      console.error("Failed to update note:", error);
    },
  });
}