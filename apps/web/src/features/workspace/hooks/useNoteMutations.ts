import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote, deleteNote, updateNote } from "../api/note.api";
import type { Note, NoteSummary } from "../types/workspace.types";

export function useCreateNote(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ notebookId, title }: { notebookId: string | null; title: string }) => {
      const payload = {
        workspaceId,
        title: title.trim() || "Untitled",
        ...(notebookId ? { notebookId } : {}),
      };
      return createNote(payload);
    },
    onSuccess: () => {
      // A newly-created item is not present in the cache yet, so one list
      // refresh is appropriate here.
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  const notesKey = ["notes"];

  return useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notesKey });
      const previous = queryClient.getQueryData<NoteSummary[]>(notesKey);

      queryClient.setQueryData<NoteSummary[]>(notesKey, (old) =>
        old?.filter((note) => note.id !== id),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notesKey, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: notesKey }),
  });
}

/**
 * Used by the editor autosave and title/folder updates.
 *
 * Content-only saves intentionally DO NOT invalidate the notes list. The list
 * does not display document content, and refetching it after every 800ms
 * autosave creates unnecessary network traffic and sidebar renders.
 */
export function useUpdateNote(noteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { title?: string; content?: object; notebookId?: string | null }) =>
      updateNote(noteId, payload),

    onSuccess: (note: Note, variables) => {
      // Keep the open note completely in sync without another GET /notes/:id.
      queryClient.setQueryData(["note", note.id], note);

      // Only fields represented by NoteSummary can affect the library tree.
      // Content saves therefore skip this update entirely.
      if (variables.title !== undefined || variables.notebookId !== undefined) {
        queryClient.setQueryData<NoteSummary[]>(["notes"], (old) =>
          old?.map((summary) =>
            summary.id === note.id
              ? {
                  ...summary,
                  title: note.title,
                  notebookId: note.notebookId,
                  updatedAt: note.updatedAt,
                }
              : summary,
          ),
        );
      }
    },

    onError: (error) => {
      console.error("Failed to update note:", error);
    },
  });
}

export function useRenameNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      updateNote(id, { title }),
    onSuccess: (note: Note) => {
      queryClient.setQueryData(["note", note.id], note);
      queryClient.setQueryData<NoteSummary[]>(["notes"], (old) =>
        old?.map((summary) =>
          summary.id === note.id
            ? {
                ...summary,
                title: note.title,
                notebookId: note.notebookId,
                updatedAt: note.updatedAt,
              }
            : summary,
        ),
      );
    },
  });
}
