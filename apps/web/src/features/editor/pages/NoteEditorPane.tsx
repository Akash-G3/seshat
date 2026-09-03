import type { Block } from "@blocknote/core";
import { useNote } from "../hooks/useNote";
import { NoteEditor } from "../components/NoteEditor";

interface Props {
  noteId: string;
}

export function NoteEditorPane({ noteId }: Props) {
  const { data: note, isLoading, isError } = useNote(noteId);

  if (isLoading) {
    return <div className="flex-1 p-8 text-sm text-text-muted">Loading note…</div>;
  }
  if (isError || !note) {
    return <div className="flex-1 p-8 text-sm text-danger">Couldn't load note</div>;
  }

  return (
    <NoteEditor
      key={note.id}
      noteId={note.id}
      initialContent={note.document.content as unknown as Block[] | undefined}
    />
  );
}
