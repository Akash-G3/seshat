import { useCallback, useEffect, useMemo, useState } from "react";

import { NoteEditorPane } from "@features/editor/pages/NoteEditorPane";
import { QuickSwitcher } from "@features/search/QuickSwitcher";
import { useRecentNotes } from "@features/search/useRecentNotes";
import { ConfirmDialog } from "@components/ui/ConfirmDialog";
import { ActivityBar } from "@features/activityBar";
import { WorkspaceHeader, useTabs } from "@features/workspaceHeader";
import { Library } from "@features/library";
import { useFavourites } from "@features/favourites/hooks/useFavourites";
import { useAddFavourite, useRemoveFavourite } from "@features/favourites/hooks/useFavouriteMutations";
import { WorkspaceShell } from "../components/WorkspaceShell";
import { useWorkspaceTree } from "../hooks/useWorkspaceTree";
import { useCreateNote, useRenameNote } from "../hooks/useNoteMutations";
import { useCreateNotebook, useRenameNotebook } from "../hooks/useNotebookMutations";
import { useRenameWorkspace } from "../hooks/useWorkspaceMutations";
import { ExportDialog } from "@features/export/components/ExportDialog/ExportDialog";
import { CopyDialog } from "@features/export/components/CopyDialog/CopyDialog";
import { ShareDialog } from "@features/share/components/ShareDialog/ShareDialog";
import { useMoveToTrash } from "@features/trash/hooks/useTrash";
import { useAuth } from "@app/AuthContext";
import type { NotebookNode } from "../types/workspace.types";

type LibraryView = "workspace" | "favourites" | "tags" | "trash";

interface PendingDelete {
  type: "note" | "notebook";
  id: string;
  label: string;
}

interface CopyTarget {
  type: "note" | "notebook";
  id: string;
  title: string;
  notebookId?: string | null;
}

interface ShareTarget {
  type: "note" | "notebook";
  id: string;
  title: string;
}

export function Workspace() {
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [libraryView, setLibraryView] = useState<LibraryView>("workspace");
  const [searchOpen, setSearchOpen] = useState(false);
  const [createMode, setCreateMode] = useState<"note" | "notebook" | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [copyTarget, setCopyTarget] = useState<CopyTarget | null>(null);
  const [shareTarget, setShareTarget] = useState<ShareTarget | null>(null);
  const [exportTarget, setExportTarget] = useState<{ id: string; title: string } | null>(null);

  const { setWorkspace } = useAuth();
  const { workspace, tree, isLoading, isError } = useWorkspaceTree();
  const { tabs, activeTabId, openTab, closeTab, syncTitles } = useTabs();
  const { recent: recentNotes, addRecent } = useRecentNotes();

  const workspaceId = workspace?.id ?? "";

  const { mutate: createNote } = useCreateNote(workspaceId);
  const { mutate: createNotebook } = useCreateNotebook(workspaceId);
  const { mutate: renameNotebook } = useRenameNotebook(workspaceId);
  const { mutate: renameNote } = useRenameNote();
  const { mutate: renameWorkspaceMutation } = useRenameWorkspace();

  const { data: favourites = [] } = useFavourites(workspaceId);
  const { mutate: addFavourite } = useAddFavourite(workspaceId);
  const { mutate: removeFavourite } = useRemoveFavourite(workspaceId);

  const { mutate: moveToTrash } = useMoveToTrash(workspaceId);

  const favouriteIds = useMemo(
    () => new Set(favourites.map((item) => `${item.type}:${item.id}`)),
    [favourites],
  );

  const { noteIndex, notebookIndex } = useMemo(() => {
    const notes = new Map<string, { title: string; notebookId: string | null }>();
    const notebooks = new Map<string, { id: string; title: string; parentId: string | null }>();

    if (!tree) return { noteIndex: notes, notebookIndex: notebooks };

    const walk = (nodes: NotebookNode[]) => {
      for (const notebook of nodes) {
        notebooks.set(notebook.id, {
          id: notebook.id,
          title: notebook.title,
          parentId: notebook.parentId,
        });

        for (const note of notebook.notes) {
          notes.set(note.id, { title: note.title, notebookId: notebook.id });
        }

        walk(notebook.children);
      }
    };

    walk(tree.notebooks);

    for (const note of tree.unfiledNotes) {
      notes.set(note.id, { title: note.title, notebookId: null });
    }

    return { noteIndex: notes, notebookIndex: notebooks };
  }, [tree]);

  const findNote = useCallback(
    (noteId: string) => noteIndex.get(noteId),
    [noteIndex],
  );

  const findNotebook = useCallback(
    (notebookId: string) => notebookIndex.get(notebookId),
    [notebookIndex],
  );

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

    if (activeNoteId === noteId) {
      setActiveNoteId(next[index]?.noteId ?? next[index - 1]?.noteId ?? null);
    }
  }, [tabs, closeTab, activeNoteId]);

  const noteTitles = useMemo(() => {
    const titles = new Map<string, string>();
    for (const [id, info] of noteIndex) titles.set(id, info.title);
    return titles;
  }, [noteIndex]);

  useEffect(() => {
    syncTitles(noteTitles);
  }, [noteTitles, syncTitles]);

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

  const toggleFavourite = useCallback(
    (type: "note" | "notebook", id: string, isFavourite: boolean) => {
      const target = { type, id } as const;
      if (isFavourite) removeFavourite(target);
      else addFavourite(target);
    },
    [addFavourite, removeFavourite],
  );

  const createNewNote = useCallback(
    (notebookId: string | null, title: string) => {
      if (!workspaceId) return;
      createNote(
        { notebookId, title },
        { onSuccess: (note) => selectNote(note.id) },
      );
    },
    [createNote, selectNote, workspaceId],
  );

  const createNewNotebook = useCallback(
    (title: string, parentId: string | null = null) => {
      if (!workspaceId) return;
      createNotebook({ title, parentId });
    },
    [createNotebook, workspaceId],
  );

  const createNotebookByParent = useCallback(
    (parentId: string | null, title: string) => {
      createNewNotebook(title, parentId);
    },
    [createNewNotebook],
  );

  const askTrash = useCallback(
    (type: "note" | "notebook", id: string) => {
      const label =
        type === "note"
          ? findNote(id)?.title || "Untitled"
          : findNotebook(id)?.title || "Notebook";

      setPendingDelete({ type, id, label });
    },
    [findNote, findNotebook],
  );

  const confirmTrash = useCallback(() => {
    if (!pendingDelete) return;

    const target = pendingDelete;
    moveToTrash(
      { type: target.type, id: target.id },
      {
        onSuccess: () => {
          if (target.type === "note" && activeNoteId === target.id) {
            closeTab(target.id);
            setActiveNoteId(null);
          }
        },
      },
    );

    setPendingDelete(null);
  }, [activeNoteId, closeTab, moveToTrash, pendingDelete]);

  const openShare = useCallback(
    (type: "note" | "notebook", id: string) => {
      const title =
        type === "note"
          ? findNote(id)?.title || "Untitled"
          : findNotebook(id)?.title || "Notebook";

      setShareTarget({ type, id, title });
    },
    [findNote, findNotebook],
  );

  const openCopy = useCallback(
    (type: "note" | "notebook", id: string) => {
      const note = type === "note" ? findNote(id) : undefined;
      const notebook = type === "notebook" ? findNotebook(id) : undefined;

      setCopyTarget({
        type,
        id,
        title: type === "note" ? note?.title || "Untitled" : notebook?.title || "Notebook",
        notebookId: note?.notebookId,
      });
    },
    [findNote, findNotebook],
  );

  const exportNote = useCallback(
    (id: string) => {
      setExportTarget({ id, title: findNote(id)?.title || "Untitled" });
    },
    [findNote],
  );

  const renameNoteById = useCallback(
    (id: string, title: string) => renameNote({ id, title }),
    [renameNote],
  );

  const renameNotebookById = useCallback(
    (id: string, title: string) => renameNotebook({ id, title }),
    [renameNotebook],
  );

  const deleteNotebookById = useCallback(
    (id: string) => askTrash("notebook", id),
    [askTrash],
  );

  const deleteNoteById = useCallback(
    (id: string) => askTrash("note", id),
    [askTrash],
  );

  const renameWorkspace = useCallback(
    (name: string) => {
      renameWorkspaceMutation(name, {
        onSuccess: setWorkspace,
      });
    },
    [renameWorkspaceMutation, setWorkspace],
  );

  const handleCreateModeNote = useCallback(() => setCreateMode("note"), []);
  const handleCreateModeNotebook = useCallback(() => setCreateMode("notebook"), []);
  const handleOpenSearch = useCallback(() => setSearchOpen(true), []);
  const handleOpenLibrary = useCallback(() => {
    setLibraryOpen(true);
    setLibraryView("workspace");
  }, []);
  const handleOpenFavourites = useCallback(() => {
    setLibraryOpen(true);
    setLibraryView("favourites");
  }, []);
  const handleOpenTags = useCallback(() => {
    setLibraryOpen(true);
    setLibraryView("tags");
  }, []);
  const handleOpenTrash = useCallback(() => {
    setLibraryOpen(true);
    setLibraryView("trash");
  }, []);
  const handleToggleLibrary = useCallback(() => {
    setLibraryOpen((value) => !value);
    setLibraryView("workspace");
  }, []);
  const handleCloseSearch = useCallback(() => setSearchOpen(false), []);
  const handleClosePendingDelete = useCallback(() => setPendingDelete(null), []);
  const handleCloseCopy = useCallback(() => setCopyTarget(null), []);
  const handleCloseExport = useCallback(() => setExportTarget(null), []);
  const handleCloseShare = useCallback(() => setShareTarget(null), []);

  const shareNote = useCallback((id: string) => openShare("note", id), [openShare]);
  const shareNotebook = useCallback((id: string) => openShare("notebook", id), [openShare]);
  const copyNote = useCallback((id: string) => openCopy("note", id), [openCopy]);
  const copyNotebook = useCallback((id: string) => openCopy("notebook", id), [openCopy]);
  const handleLibraryView = useCallback(() => setLibraryView("workspace"), []);
  const editorShare = useCallback(() => {
    if (activeNoteId) openShare("note", activeNoteId);
  }, [activeNoteId, openShare]);
  const editorCopy = useCallback(() => {
    if (activeNoteId) openCopy("note", activeNoteId);
  }, [activeNoteId, openCopy]);
  const editorExport = useCallback(() => {
    if (activeNoteId) exportNote(activeNoteId);
  }, [activeNoteId, exportNote]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-bg text-sm text-text-muted">Loading workspace…</div>;
  }

  if (isError || !workspace || !tree) {
    return <div className="flex h-screen items-center justify-center bg-bg text-sm text-danger">Couldn't load workspace</div>;
  }

  return (
    <>
      <WorkspaceShell
        activityBar={
          <ActivityBar
            libraryOpen={libraryOpen && libraryView === "workspace"}
            favouritesOpen={libraryOpen && libraryView === "favourites"}
            tagsOpen={libraryOpen && libraryView === "tags"}
            trashOpen={libraryOpen && libraryView === "trash"}
            onCreateNote={handleCreateModeNote}
            onCreateNotebook={handleCreateModeNotebook}
            onSearch={handleOpenSearch}
            onOpenLibrary={handleOpenLibrary}
            onFavourites={handleOpenFavourites}
            onTags={handleOpenTags}
            onTrash={handleOpenTrash}
            onToggleLibrary={handleToggleLibrary}
          />
        }
        library={
          libraryOpen ? (
            <Library
              tree={tree}
              workspaceId={workspaceId}
              activeNoteId={activeNoteId}
              view={libraryView}
              favourites={favourites}
              favouriteIds={favouriteIds}
              onSelectNote={selectNote}
              onCreateNote={createNewNote}
              onCreateNotebook={createNotebookByParent}
              onRenameNote={renameNoteById}
              onDeleteNote={deleteNoteById}
              onRenameNotebook={renameNotebookById}
              onDeleteNotebook={deleteNotebookById}
              onToggleFavourite={toggleFavourite}
              onShareNote={shareNote}
              onShareNotebook={shareNotebook}
              onCopyNote={copyNote}
              onCopyNotebook={copyNotebook}
              onExportNote={exportNote}
              createMode={createMode}
              onCreateModeChange={setCreateMode}
              onOpenLibrary={handleLibraryView}
            />
          ) : undefined
        }
        header={
          <WorkspaceHeader
            workspaceName={workspace.name}
            tabs={tabs}
            activeTabId={activeTabId}
            onToggleLibrary={handleToggleLibrary}
            onRenameWorkspace={renameWorkspace}
            onSelectTab={selectNote}
            onCloseTab={closeNoteTab}
          />
        }
        content={
          activeNoteId ? (
            <NoteEditorPane
              noteId={activeNoteId}
              workspaceId={workspaceId}
              onShare={editorShare}
              onCopy={editorCopy}
              onExport={editorExport}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-text-muted">
              Select a note to start writing.
            </div>
          )
        }
      />

      <QuickSwitcher
        open={searchOpen}
        onClose={handleCloseSearch}
        onSelectNote={selectNote}
        recentNotes={recentNotes}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Move ${pendingDelete?.type === "notebook" ? "notebook" : "note"} to trash?`}
        message={`“${pendingDelete?.label ?? ""}” can be restored from Trash.`}
        confirmLabel="Move to trash"
        onConfirm={confirmTrash}
        onCancel={handleClosePendingDelete}
      />

      {copyTarget && (
        <CopyDialog
          open
          type={copyTarget.type}
          id={copyTarget.id}
          title={copyTarget.title}
          workspaceId={workspaceId}
          notebooks={tree.notebooks}
          currentNotebookId={copyTarget.notebookId}
          onClose={handleCloseCopy}
        />
      )}

      {exportTarget && (
        <ExportDialog
          open
          noteId={exportTarget.id}
          title={exportTarget.title}
          onClose={handleCloseExport}
        />
      )}

      {shareTarget && (
        <ShareDialog
          open
          type={shareTarget.type}
          id={shareTarget.id}
          title={shareTarget.title}
          onClose={handleCloseShare}
        />
      )}
    </>
  );
}
