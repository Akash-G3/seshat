import { useTheme } from "@app/ThemeContext";
import { lightEditorTheme, darkEditorTheme } from "@lib/blocknoteTheme";

import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import type { Block } from "@blocknote/core";
import "@blocknote/mantine/style.css";
import { useUpdateNote } from "@features/workspace/hooks/useNoteMutations";
import { NoteTitle } from "./NoteTitle/NoteTitle";
import type { Note } from "@features/workspace/types/workspace.types";


interface Props {
  noteId: string;
  title: string;
  onRenameTitle: (title: string) => void;
  // Whatever was last persisted in the note's `content` JSONB column.
  // Undefined/empty for a brand-new note.
  initialContent?: Block[];
}

const SAVE_DEBOUNCE_MS = 800;

// Render this keyed by noteId from the parent (key={noteId}) so switching
// notes mounts a fresh editor instance instead of BlockNote trying to
// hot-swap content on an existing one.
export function NoteEditor({ noteId, title, onRenameTitle, initialContent }: Props) {
  const queryClient = useQueryClient();
  const updateNote = useUpdateNote(noteId);
  //theme
  const { theme } = useTheme();

  const editor = useCreateBlockNote({
    initialContent: initialContent && initialContent.length > 0 ? initialContent : undefined,
  });

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirtyRef = useRef(false);

    const scheduleSave = useCallback(() => {
    const blocks = editor.document;

    // Update the query cache immediately (synchronously, on every change) —
    // not just after the debounced network save resolves. useNote() reads
    // from this cache, and BlockNoteView is an UNCONTROLLED component that
    // only reads initialContent once at mount. Without this, switching notes
    // before the debounced PATCH lands reads stale pre-edit content from the
    // cache and the editor never picks up the correction later — that's the
    // "content vanishes the moment I switch notes" bug.
    queryClient.setQueryData(["note", noteId], (old: Note | undefined) =>
      old ? { ...old, content: blocks } : old
    );

    isDirtyRef.current = true;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      isDirtyRef.current = false;
      updateNote.mutate({ content: blocks });
    }, SAVE_DEBOUNCE_MS);
  }, [editor, noteId, queryClient, updateNote]);

  // Flush any pending debounced network save immediately when this note is
  // closed or swapped out, so the backend save isn't left dangling on a
  // component unmount. (The cache is already correct thanks to scheduleSave
  // above, regardless of whether this network call has resolved yet.)
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (isDirtyRef.current) {
        updateNote.mutate({ content: editor.document });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  return (
    <div className="h-full min-h-0 overflow-y-auto scrollbar-none bg-bg-editor px-8 py-6">
      <NoteTitle title={title} onRename={onRenameTitle} />
      <div className="mt-2">
        <BlockNoteView
          editor={editor}
          theme={theme === "dark" ? darkEditorTheme : lightEditorTheme}
          onChange={scheduleSave}
        />
      </div>
    </div>
  );
}