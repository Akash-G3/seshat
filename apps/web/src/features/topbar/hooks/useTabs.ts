import { useCallback, useState } from "react";
import type { OpenTab } from "../types";

export function useTabs() {
  const [tabs, setTabs] = useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const openTab = useCallback((tab: OpenTab) => {
    setTabs((prev) =>
      prev.some((t) => t.noteId === tab.noteId) ? prev : [...prev, tab]
    );
    setActiveTabId(tab.noteId);
  }, []);

  const closeTab = useCallback((noteId: string) => {
    setTabs((prev) => {
      const closedIndex = prev.findIndex((t) => t.noteId === noteId);
      const next = prev.filter((t) => t.noteId !== noteId);
      setActiveTabId((current) => {
        if (current !== noteId) return current;
        return next[closedIndex]?.noteId ?? next[closedIndex - 1]?.noteId ?? null;
      });
      return next;
    });
  }, []);

  // Called when the sidebar renames a note, so the open tab's label doesn't go stale
  const syncTitles = useCallback((titleById: Map<string, string>) => {
    setTabs((prev) =>
      prev.map((t) =>
        titleById.has(t.noteId) && titleById.get(t.noteId) !== t.title
          ? { ...t, title: titleById.get(t.noteId)! }
          : t
      )
    );
  }, []);

  return { tabs, activeTabId, setActiveTabId, openTab, closeTab, syncTitles };
}