import { useCallback, useEffect, useState } from "react";

export interface RecentNote {
  id: string;
  title: string;
}

const STORAGE_KEY = "seshat.recentNotes";
const MAX_RECENT = 8;

export function useRecentNotes() {
  const [recent, setRecent] = useState<RecentNote[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {
      // corrupt/blocked storage — fall back to empty
    }
  }, []);

  const addRecent = useCallback((note: RecentNote) => {
    setRecent((prev) => {
      const next = [note, ...prev.filter((n) => n.id !== note.id)].slice(0, MAX_RECENT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { recent, addRecent };
}