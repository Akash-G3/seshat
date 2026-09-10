import { useEffect, useState } from "react";
import { FileText, Notebook, Clock } from "lucide-react";
import { useSearch } from "./useSearch";
import type { RecentNote } from "./useRecentNotes";

interface Item {
  id: string;
  title: string;
  type: "note" | "notebook";
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectNote: (noteId: string) => void;
  recentNotes: RecentNote[];
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>; // typo-matched result — no literal substring to highlight
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-accent-subtle text-accent rounded-sm">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function QuickSwitcher({ open, onClose, onSelectNote, recentNotes }: Props) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const { results, isLoading } = useSearch(query, open);

  const showingRecent = query.trim().length === 0;
  const items: Item[] = showingRecent
    ? recentNotes.map((r) => ({ id: r.id, title: r.title, type: "note" }))
    : results;

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!open) return null;

  function commit(item: Item | undefined) {
    if (!item || item.type !== "note") return;
    onSelectNote(item.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/20 flex items-start justify-center pt-[15vh] z-50" onClick={onClose}>
      <div
        className="bg-bg rounded-md border border-border shadow-lg w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, items.length - 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
            }
            if (e.key === "Enter") commit(items[activeIndex]);
          }}
          placeholder="Search notes and notebooks…"
          className="w-full px-4 h-12 text-sm bg-bg text-text-primary border-b border-border outline-none placeholder:text-text-muted"
        />

        {showingRecent && items.length > 0 && (
          <div className="px-4 pt-2 text-xs font-medium text-text-muted uppercase tracking-wide">Recent</div>
        )}

        <div className="max-h-80 overflow-y-auto py-1">
          {isLoading ? (
            <div className="px-4 py-6 text-sm text-text-muted text-center">Searching…</div>
          ) : items.length === 0 ? (
            <div className="px-4 py-6 text-sm text-text-muted text-center">
              {showingRecent ? "No recent notes yet" : "No matches"}
            </div>
          ) : (
            items.map((item, i) => (
              <div
                key={`${item.type}-${item.id}`}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => commit(item)}
                className={`flex items-center gap-2 px-4 h-9 text-sm cursor-pointer ${
                  i === activeIndex ? "bg-bg-hover text-text-primary" : "text-text-secondary"
                } ${item.type === "notebook" ? "cursor-default opacity-60" : ""}`}
              >
                {showingRecent ? <Clock size={14} /> : item.type === "notebook" ? <Notebook size={14} /> : <FileText size={14} />}
                <span className="truncate flex-1">
                  <HighlightMatch text={item.title || "Untitled"} query={showingRecent ? "" : query} />
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}