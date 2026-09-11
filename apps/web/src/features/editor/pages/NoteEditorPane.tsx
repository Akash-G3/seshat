
import type { Block } from "@blocknote/core";
import { useNote } from "../hooks/useNote";
import { NoteEditor } from "../components/NoteEditor";
import { TagPicker } from "@features/tags/components/TagPicker/TagPicker";
import { NoteActions } from "../components/NoteActions/NoteActions";

interface Props {
  noteId: string;
  workspaceId: string;
  onShare: () => void;
  onCopy: () => void;
  onExport: () => void;
}

export function NoteEditorPane({ noteId, workspaceId, onShare, onCopy, onExport }: Props) {
  const { data: note, isLoading, isError } = useNote(noteId);

  if (isLoading) {
    return <div className="flex-1 p-8 text-sm text-text-muted">Loading note…</div>;
  }
  if (isError || !note) {
    return <div className="flex-1 p-8 text-sm text-danger">Couldn't load note</div>;
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-3 px-8 pt-5">
        <TagPicker noteId={note.id} workspaceId={workspaceId} />
        <NoteActions onShare={onShare} onCopy={onCopy} onExport={onExport} />
      </div>
      <div className="min-h-0 flex-1">
        <NoteEditor
          key={note.id}
          noteId={note.id}
          initialContent={note.document.content as unknown as Block[] | undefined}
        />
      </div>
    </div>
  );
}