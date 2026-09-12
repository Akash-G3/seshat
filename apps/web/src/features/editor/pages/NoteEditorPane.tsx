import { FileWarning, Loader2 } from "lucide-react";
import type { Block } from "@blocknote/core";
import { useNote } from "../hooks/useNote";
import { NoteEditor } from "../components/NoteEditor";
import { TagPicker } from "@features/tags/components/TagPicker/TagPicker";
import { NoteActions } from "../components/NoteActions/NoteActions";
import { useUpdateNote } from "@features/workspace/hooks/useNoteMutations";

interface Props {
  noteId: string;
  workspaceId: string;
  onShare: () => void;
  onCopy: () => void;
  onExport: () => void;
}

export function NoteEditorPane({ noteId, workspaceId, onShare, onCopy, onExport }: Props) {
  const { data: note, isLoading, isError } = useNote(noteId);
  const updateNote = useUpdateNote(noteId);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-text-muted">
        <Loader2 size={18} className="animate-spin" strokeWidth={1.8} />
        <p className="text-sm">Loading note…</p>
      </div>
    );
  }

  if (isError || !note) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <FileWarning size={20} strokeWidth={1.7} className="text-danger" />
        <p className="text-sm text-text-secondary">Couldn't load this note</p>
        <p className="text-xs text-text-muted">It may have been moved or removed.</p>
      </div>
    );
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
          title={note.title}
          onRenameTitle={(title) => updateNote.mutate({ title })}
          initialContent={note.document.content as unknown as Block[] | undefined}
        />
      </div>
    </div>
  );
}