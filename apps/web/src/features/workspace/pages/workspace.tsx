import { useCallback, useEffect, useState } from "react";
import { NoteEditorPane } from "@features/editor/pages/NoteEditorPane";
import { QuickSwitcher } from "@features/search/QuickSwitcher";
import { useRecentNotes } from "@features/search/useRecentNotes";
import { ConfirmDialog } from "@components/ui/ConfirmDialog";
import { ActivityBar } from "@features/activityBar";
import { WorkspaceHeader, useTabs } from "@features/workspaceHeader";
import { Library } from "@features/library";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { useWorkspaceTree } from "../hooks/useWorkspaceTree";
import { useCreateNote, useDeleteNote, useUpdateNote } from "../hooks/useNoteMutations";
import { useCreateNotebook, useDeleteNotebook, useRenameNotebook } from "../hooks/useNotebookMutations";
import { useRenameWorkspace } from "../hooks/useWorkspaceMutations";

interface PendingDelete {
  type: "note" | "notebook";
  id: string;
  label: string;
}

interface CreateDialogProps {
  open: boolean;
  title: string;
  placeholder: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

function CreateDialog({ open, title, placeholder, onSubmit, onCancel }: CreateDialogProps) {
  const [value, setValue] = useState("");
  useEffect(() => { if (open) setValue(""); }, [open]);
  if (!open) return null;

  function submit() {
    const next = value.trim();
    if (next) onSubmit(next);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onMouseDown={onCancel}>
      <div className="w-80 rounded-md border border-border bg-bg p-5 shadow-lg" onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="mb-3 text-sm font-semibold text-text-primary">{title}</h2>
        <input autoFocus value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") onCancel(); }} placeholder={placeholder} className="h-9 w-full rounded-sm border border-border bg-bg px-2 text-sm text-text-primary outline-none focus:border-accent" />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-sm px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-hover">Cancel</button>
          <button type="button" onClick={submit} className="rounded-sm bg-accent px-3 py-1.5 text-sm text-white hover:opacity-90">Create</button>
        </div>
      </div>
    </div>
  );
}

export function Workspace() {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [createNoteOpen, setCreateNoteOpen] = useState(false);
  const [createNotebookOpen, setCreateNotebookOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const { workspace, tree, isLoading, isError } = useWorkspaceTree();
  const { tabs, activeTabId, openTab, closeTab, syncTitles } = useTabs();
  const { recent: recentNotes, addRecent } = useRecentNotes();

  const workspaceId = workspace?.id;
  const createNote = useCreateNote(workspaceId ?? "");
  const createNotebook = useCreateNotebook(workspaceId ?? "");
  const renameNotebook = useRenameNotebook(workspaceId ?? "");
  const deleteNotebook = useDeleteNotebook(workspaceId ?? "");
  const updateNote = useUpdateNote(activeNoteId ?? "");
  const deleteNote = useDeleteNote();
  const renameWorkspace = useRenameWorkspace();

  const findNote = useCallback((noteId: string) => {
    if (!tree) return undefined;

    function search(notebooks: typeof tree.notebooks): { title: string; notebookId: string } | undefined {
      for (const notebook of notebooks) {
        const note = notebook.notes.find((item) => item.id === noteId);
        if (note) return { title: note.title, notebookId: notebook.id };

        const nested = search(notebook.children);
        if (nested) return nested;
      }
      return undefined;
    }

    const nested = search(tree.notebooks);
    if (nested) return nested;

    const note = tree.unfiledNotes.find((item) => item.id === noteId);
    return note ? { title: note.title, notebookId: null } : undefined;
  }, [tree]);

  const selectNote = useCallback((noteId: string) => {
    const info = findNote(noteId);
    const title = info?.title || "Untitled";
    openTab({ noteId, title, notebookId: info?.notebookId ?? null });
    setActiveNoteId(noteId);
    addRecent({ id: noteId, title });
  }, [findNote, openTab, addRecent]);

  const closeNoteTab = useCallback((noteId: string) => {
    const index = tabs.findIndex((tab) => tab.noteId === noteId);
    const next = tabs.filter((tab) => tab.noteId !== noteId);
    closeTab(noteId);
    if (activeNoteId === noteId) setActiveNoteId(next[index]?.noteId ?? next[index - 1]?.noteId ?? null);
  }, [tabs, closeTab, activeNoteId]);

  useEffect(() => {
    if (!tree) return;
    const titles = new Map<string, string>();
    function collect(notebooks: typeof tree.notebooks) {
      notebooks.forEach((nb) => {
        nb.notes.forEach((note) => titles.set(note.id, note.title));
        collect(nb.children);
      });
    }
    collect(tree.notebooks);
    tree.unfiledNotes.forEach((note) => titles.set(note.id, note.title));
    syncTitles(titles);
  }, [tree, syncTitles]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function createNewNote(notebookId: string | null, title: string) {
    if (!workspaceId) return;
    createNote.mutate({ notebookId, title }, {
      onSuccess: (note) => selectNote(note.id),
    });
    setCreateNoteOpen(false);
  }

  function createNewNotebook(title: string, parentId: string | null = null) {
    if (!workspaceId) return;
    createNotebook.mutate({ title, parentId });
    setCreateNotebookOpen(false);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    if (pendingDelete.type === "note") {
      deleteNote.mutate(pendingDelete.id, {
        onSuccess: () => { if (activeNoteId === pendingDelete.id) { closeTab(pendingDelete.id); setActiveNoteId(null); } },
      });
    } else {
      deleteNotebook.mutate(pendingDelete.id);
    }
    setPendingDelete(null);
  }

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-bg text-sm text-text-muted">Loading workspace…</div>;
  if (isError || !workspace || !tree) return <div className="flex h-screen items-center justify-center bg-bg text-sm text-danger">Couldn't load workspace</div>;

  return (
    <>
      <WorkspaceShell
        activityBar={
          <ActivityBar
            libraryOpen={libraryOpen}
            onCreateNote={() => setCreateNoteOpen(true)}
            onCreateNotebook={() => setCreateNotebookOpen(true)}
            onSearch={() => setSearchOpen(true)}
            onFavourites={() => { /* Placeholder until favourites backend/UI is implemented. */ }}
            onToggleLibrary={() => setLibraryOpen((value) => !value)}
          />
        }
        library={libraryOpen ? <Library tree={tree} activeNoteId={activeNoteId} onSelectNote={selectNote} onCreateNote={createNewNote} onCreateNotebook={(parentId, title) => createNewNotebook(title, parentId)} onRenameNote={(id, title) => updateNote.mutate({ title })} onDeleteNote={(id) => { const note = findNote(id); setPendingDelete({ type: "note", id, label: note?.title || "Untitled" }); }} onRenameNotebook={(id, title) => renameNotebook.mutate({ id, title })} onDeleteNotebook={(id) => { const notebook = tree.notebooks.find((item) => item.id === id); setPendingDelete({ type: "notebook", id, label: notebook?.title || "Notebook" }); }} /> : undefined}
        header={
          <WorkspaceHeader
            workspaceName={workspace.name}
            tabs={tabs}
            activeTabId={activeTabId}
            onToggleLibrary={() => setLibraryOpen((value) => !value)}
            onRenameWorkspace={(name) => renameWorkspace.mutate(name)}
            onSelectTab={selectNote}
            onCloseTab={closeNoteTab}
          />
        }
        content={activeNoteId ? <NoteEditorPane noteId={activeNoteId} /> : <div className="flex h-full items-center justify-center text-sm text-text-muted">Select a note to start writing.</div>}
      />

      <QuickSwitcher open={searchOpen} onClose={() => setSearchOpen(false)} onSelectNote={selectNote} recentNotes={recentNotes} />

      <CreateDialog open={createNoteOpen} title="Create note" placeholder="Note title" onSubmit={(title) => createNewNote(null, title)} onCancel={() => setCreateNoteOpen(false)} />
      <CreateDialog open={createNotebookOpen} title="Create notebook" placeholder="Notebook name" onSubmit={createNewNotebook} onCancel={() => setCreateNotebookOpen(false)} />

      <ConfirmDialog open={!!pendingDelete} title={`Delete ${pendingDelete?.type === "notebook" ? "notebook" : "note"}?`} message={`“${pendingDelete?.label ?? ""}” will be deleted.`} onConfirm={confirmDelete} onCancel={() => setPendingDelete(null)} />
    </>
  );
}
