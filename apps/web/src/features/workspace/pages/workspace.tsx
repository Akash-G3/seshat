// import { useLogout } from "@features/auth/useLogout";
import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { NoteEditorPane } from "@features/editor/pages/NoteEditorPane";

export function Workspace() {
  const [activeNoteId, setActiveNoteId] = useState<string | undefined>();

  return (
    <div className="flex h-screen">
      <Sidebar activeNoteId={activeNoteId} onSelectNote={setActiveNoteId} />
      {activeNoteId ? (
        <NoteEditorPane noteId={activeNoteId} />
      ) : (
        <main className="flex-1 p-8 text-text-muted">Select a note</main>
      )}
    </div>
  );
}