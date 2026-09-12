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
  initialContent?: Block[];
}

const SAVE_DEBOUNCE_MS = 800;

export function NoteEditor({ noteId, title, onRenameTitle, initialContent }: Props) {
  const queryClient = useQueryClient();
  const { mutate: saveNote } = useUpdateNote(noteId);
  const { theme } = useTheme();

  const editor = useCreateBlockNote({
    initialContent:
      initialContent && initialContent.length > 0 ? initialContent : undefined,
  });

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirtyRef = useRef(false);
  const saveNoteRef = useRef(saveNote);

  // Keep the latest mutation function available to the cleanup without
  // making the cleanup effect depend on the mutation result object.
  useEffect(() => {
    saveNoteRef.current = saveNote;
  }, [saveNote]);

  const scheduleSave = useCallback(() => {
    const blocks = editor.document;

    // Keep the individual note query in sync immediately while the server
    // save is debounced. The Note shape stores content under `document`.
    queryClient.setQueryData(["note", noteId], (old: Note | undefined) =>
      old
        ? {
            ...old,
            document: {
              ...old.document,
              content: blocks,
            },
          }
        : old,
    );

    isDirtyRef.current = true;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;
      isDirtyRef.current = false;
      saveNoteRef.current({ content: blocks });
    }, SAVE_DEBOUNCE_MS);
  }, [editor, noteId, queryClient]);

  // This cleanup runs when the note editor unmounts (the parent keys it by
  // noteId), not on every render. It flushes the last unsaved document once.
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      if (isDirtyRef.current) {
        isDirtyRef.current = false;
        saveNoteRef.current({ content: editor.document });
      }
    };
  }, [editor]);

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
