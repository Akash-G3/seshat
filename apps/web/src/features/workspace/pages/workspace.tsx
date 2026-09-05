
import { useCallback, useEffect, useMemo, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { NoteEditorPane } from "@features/editor/pages/NoteEditorPane";
import { useWorkspaceTree } from "../hooks/useWorkspaceTree";
import { TopBarLeft } from "../../topbar/components/TopBarLeft";
import { TopBarMain } from "../../topbar/components/TopBarMain";
import { useTabs } from "../../topbar/hooks/useTabs";
import { useNavigationHistory } from "../../topbar/hooks/useNavigationHistory";
import type { BreadcrumbSegment } from "../../topbar/types";
import { SIDEBAR_WIDTH } from "../constants";
import { QuickSwitcher } from "@features/search/QuickSwitcher";
import { useRecentNotes } from "@features/search/useRecentNotes";

export function Workspace() {
  const [activeNoteId, setActiveNoteId] = useState<string | undefined>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { workspace, tree } = useWorkspaceTree();

  const { tabs, activeTabId, setActiveTabId, openTab, closeTab, syncTitles } = useTabs();
  const { recent: recentNotes, addRecent } = useRecentNotes();

  const findNote = useCallback(
    (noteId: string) => {
      if (!tree) return undefined;
      for (const nb of tree.notebooks) {
        const note = nb.notes.find((n) => n.id === noteId);
        if (note) return { title: note.title, notebookId: nb.id };
      }
      const unfiled = tree.unfiledNotes.find((n) => n.id === noteId);
      return unfiled ? { title: unfiled.title, notebookId: null } : undefined;
    },
    [tree]
  );

  const goToNote = useCallback((noteId: string) => {
    setActiveNoteId(noteId);
    setActiveTabId(noteId);
  }, [setActiveTabId]);

  const { push, back, forward, canGoBack, canGoForward } = useNavigationHistory(goToNote);

  const handleSelectNote = useCallback(
    (noteId: string) => {
      const info = findNote(noteId);
      const title = info?.title ?? "Untitled";
      openTab({ noteId, title, notebookId: info?.notebookId ?? null });
      goToNote(noteId);
      push(noteId);
      addRecent({ id: noteId, title });
    },
    [findNote, openTab, goToNote, push, addRecent]
  );

  const handleCloseTab = useCallback(
    (noteId: string) => {
      closeTab(noteId);
      if (activeNoteId === noteId) {
        const remaining = tabs.filter((t) => t.noteId !== noteId);
        setActiveNoteId(remaining[remaining.length - 1]?.noteId);
      }
    },
    [closeTab, activeNoteId, tabs]
  );

  useEffect(() => {
    if (!tree) return;
    const titleById = new Map<string, string>();
    tree.notebooks.forEach((nb) => nb.notes.forEach((n) => titleById.set(n.id, n.title)));
    tree.unfiledNotes.forEach((n) => titleById.set(n.id, n.title));
    syncTitles(titleById);
  }, [tree, syncTitles]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const breadcrumbs: BreadcrumbSegment[] = useMemo(() => {
    if (!tree || !workspace || !activeNoteId) return [];
    const segments: BreadcrumbSegment[] = [{ id: workspace.id, label: workspace.name, type: "workspace" }];

    for (const nb of tree.notebooks) {
      const note = nb.notes.find((n) => n.id === activeNoteId);
      if (note) {
        segments.push({ id: nb.id, label: nb.title, type: "notebook" });
        segments.push({ id: note.id, label: note.title, type: "note" });
        return segments;
      }
    }
    const unfiled = tree.unfiledNotes.find((n) => n.id === activeNoteId);
    if (unfiled) segments.push({ id: unfiled.id, label: unfiled.title, type: "note" });
    return segments;
  }, [tree, workspace, activeNoteId]);

  return (
    <div className="flex h-screen bg-bg">
      <div
        className="flex flex-col shrink-0 border-r border-border overflow-hidden"
        style={{ width: sidebarCollapsed ? 0 : SIDEBAR_WIDTH }}
      >
        <TopBarLeft
          workspaceName={workspace?.name ?? ""}
          onNewNotebook={() => setIsCreatingNotebook(true)}
          onNewNote={() => setIsCreatingNote(true)}
        />
        <Sidebar
          activeNoteId={activeNoteId}
          onSelectNote={handleSelectNote}
          isCreatingNotebook={isCreatingNotebook}
          setIsCreatingNotebook={setIsCreatingNotebook}
          isCreatingNote={isCreatingNote}
          setIsCreatingNote={setIsCreatingNote}
        />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <TopBarMain
          breadcrumbs={breadcrumbs}
          onBreadcrumbClick={(seg) => {
            if (seg.type === "note") handleSelectNote(seg.id);
          }}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
          onOpenSearch={() => setIsSearchOpen(true)}
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={handleSelectNote}
          onCloseTab={handleCloseTab}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          onBack={back}
          onForward={forward}
        />
        <div className="flex-1 overflow-hidden">
          {activeNoteId ? (
            <NoteEditorPane noteId={activeNoteId} />
          ) : (
            <main className="h-full bg-bg p-8 text-text-muted">Select a note</main>
          )}
        </div>
      </div>

      <QuickSwitcher
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectNote={handleSelectNote}
        recentNotes={recentNotes}
      />
    </div>
  );
}