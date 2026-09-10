import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { FileText, Folder, Hash } from "lucide-react";
import { getPublicShare } from "../api/share.api";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { lightEditorTheme } from "@lib/blocknoteTheme";
import type { Block } from "@blocknote/core";
import "@blocknote/mantine/style.css";

interface SharedNote {
  type: "note";
  title: string;
  content: unknown;
  tags: string[];
  updatedAt: string;
}

interface SharedNotebook {
  type: "notebook";
  title: string;
  content?: never;
  notebooks: Array<{ id: string; title: string; parentId: string | null; updatedAt: string }>;
  notes: Array<{ id: string; title: string; notebookId: string | null; content: unknown; tags: string[]; updatedAt: string }>;
}

function SharedNoteContent({ note }: { note: SharedNote }) {
  const editor = useCreateBlockNote({
    initialContent: (note.content as Block[])?.length ? (note.content as Block[]) : undefined,
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-text-primary">{note.title || "Untitled"}</h1>
        <div className="mt-2 flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-0.5 rounded-sm bg-accent-subtle px-1.5 py-0.5 text-xs text-accent">
              <Hash size={10} /> {tag}
            </span>
          ))}
        </div>
      </div>
      <BlockNoteView editor={editor} theme={lightEditorTheme} editable={false} />
    </div>
  );
}

export function PublicSharePage() {
  const { token } = useParams<{ token: string }>();
  const query = useQuery({
    queryKey: ["public-share", token],
    queryFn: () => getPublicShare(token!),
    enabled: !!token,
  });

  if (query.isLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-text-muted">Loading shared content…</div>;
  }

  if (query.isError || !query.data) {
    return <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-danger">This share link is unavailable or expired.</div>;
  }

  const item = query.data as SharedNote | SharedNotebook;

  if (item.type === "note") {
    return <div className="min-h-screen bg-bg text-text-primary"><SharedNoteContent note={item} /></div>;
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-xs text-text-muted"><Folder size={14} /> Shared notebook</div>
          <h1 className="text-3xl font-semibold">{item.title}</h1>
        </div>
        <div className="space-y-2">
          {item.notes.map((note) => (
            <div key={note.id} className="rounded-md border border-border bg-bg-subtle p-4">
              <div className="flex items-center gap-2 text-sm font-medium"><FileText size={14} />{note.title || "Untitled"}</div>
              {note.tags.length > 0 && <div className="mt-2 text-xs text-text-muted">{note.tags.map((tag) => `#${tag}`).join("  ")}</div>}
            </div>
          ))}
          {item.notes.length === 0 && <p className="text-sm text-text-muted">This notebook is empty.</p>}
        </div>
      </div>
    </div>
  );
}
