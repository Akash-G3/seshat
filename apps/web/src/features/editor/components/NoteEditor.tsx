import { useTheme } from "@app/ThemeContext";
import { lightEditorTheme, darkEditorTheme } from "@lib/blocknoteTheme";

import { useCallback, useEffect, useRef } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import type { Block } from "@blocknote/core";
import "@blocknote/mantine/style.css";
import { useUpdateNote } from "@features/workspace/hooks/useNoteMutations";
import { NoteTitle } from "./NoteTitle/NoteTitle";

interface Props {
  noteId: string;
  title: string;
  onRenameTitle: (title: string) => void;
  initialContent?: Block[];
}

const SAVE_DEBOUNCE_MS = 800;


export function NoteEditor({
  noteId,
  title,
  onRenameTitle,
  initialContent,
}: Props) {
  const { theme } = useTheme();
  const { mutate: saveNote } = useUpdateNote(noteId);

  const editor = useCreateBlockNote({
    initialContent:
      initialContent && initialContent.length > 0
        ? initialContent
        : undefined,
  });

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDocumentRef = useRef<Block[]>(editor.document);
  const saveNoteRef = useRef(saveNote);
  const isDirtyRef = useRef(false);

  useEffect(() => {
    saveNoteRef.current = saveNote;
  }, [saveNote]);

  const scheduleSave = useCallback(() => {
    // BlockNote is the source of truth. Keep only a ref to the latest
    // document instead of putting the document into React state.
    latestDocumentRef.current = editor.document;
    isDirtyRef.current = true;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveTimeoutRef.current = null;

      if (!isDirtyRef.current) return;

      isDirtyRef.current = false;
      saveNoteRef.current({ content: latestDocumentRef.current });
    }, SAVE_DEBOUNCE_MS);
  }, [editor]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      // Never lose a pending edit when the note/editor unmounts.
      if (isDirtyRef.current) {
        isDirtyRef.current = false;
        saveNoteRef.current({ content: latestDocumentRef.current });
      }
    };
  }, []);

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
