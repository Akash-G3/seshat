import { useCallback, useState } from "react";
import type { OpenTab } from "../types";

export function useTabs() {
  const [tabs, setTabs] = useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const openTab = useCallback((tab: OpenTab) => {
    setTabs((current) => current.some((item) => item.noteId === tab.noteId) ? current : [...current, tab]);
    setActiveTabId(tab.noteId);
  }, []);

  const closeTab = useCallback((noteId: string) => {
    setTabs((current) => {
      const index = current.findIndex((tab) => tab.noteId === noteId);
      const next = current.filter((tab) => tab.noteId !== noteId);
      setActiveTabId((active) => active === noteId ? next[index]?.noteId ?? next[index - 1]?.noteId ?? null : active);
      return next;
    });
  }, []);

  const syncTitles = useCallback((titles: Map<string, string>) => {
    setTabs((current) => current.map((tab) => {
      const title = titles.get(tab.noteId);
      return title !== undefined && title !== tab.title ? { ...tab, title } : tab;
    }));
  }, []);

  return { tabs, activeTabId, setActiveTabId, openTab, closeTab, syncTitles };
}
