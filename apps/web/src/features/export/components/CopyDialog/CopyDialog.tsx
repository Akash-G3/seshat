import { useState } from "react";
import { Copy, X } from "lucide-react";
import type { NotebookNode } from "@features/workspace/types/workspace.types";
import { useCopyNote, useCopyNotebook } from "../../hooks/useExportMutations";

interface Props {
  open: boolean;
  type: "note" | "notebook";
  id: string;
  title: string;
  workspaceId: string;
  notebooks: NotebookNode[];
  currentNotebookId?: string | null;
  onClose: () => void;
}

function flatten(nodes: NotebookNode[], depth = 0): Array<{ id: string; title: string; depth: number }> {
  return nodes.flatMap((node) => [
    { id: node.id, title: node.title, depth },
    ...flatten(node.children, depth + 1),
  ]);
}

function collectIds(node: NotebookNode): string[] {
  return [node.id, ...node.children.flatMap(collectIds)];
}

export function CopyDialog({
  open,
  type,
  id,
  title,
  workspaceId,
  notebooks,
  currentNotebookId = null,
  onClose,
}: Props) {
  const [copyTitle, setCopyTitle] = useState(`${title || (type === "note" ? "Untitled" : "Notebook")} (copy)`);
  const [destination, setDestination] = useState(currentNotebookId ?? "");
  const copyNoteMutation = useCopyNote(workspaceId);
  const copyNotebookMutation = useCopyNotebook(workspaceId);
  const options = flatten(notebooks);
  const invalidDestinationIds = type === "notebook"
    ? new Set(notebooks.flatMap((node) => node.id === id ? collectIds(node) : []))
    : new Set<string>();

  if (!open) return null;

  async function submit() {
    if (type === "note") {
      await copyNoteMutation.mutateAsync({
        id,
        title: copyTitle.trim() || undefined,
        notebookId: destination || null,
      });
    } else {
      await copyNotebookMutation.mutateAsync({
        id,
        title: copyTitle.trim() || undefined,
        parentId: destination || null,
      });
    }
    onClose();
  }

  const pending = copyNoteMutation.isPending || copyNotebookMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4" onMouseDown={onClose}>
      <div className="w-full max-w-md rounded-md border border-border bg-bg p-5 shadow-xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Copy {type}</h2>
            <p className="mt-1 text-xs text-text-muted">Create an independent copy of “{title}”.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-text-muted hover:text-text-primary"><X size={16} /></button>
        </div>

        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-medium text-text-secondary">Name</span>
          <input
            autoFocus
            value={copyTitle}
            onChange={(event) => setCopyTitle(event.target.value)}
            className="w-full rounded-sm border border-border bg-bg-subtle px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-medium text-text-secondary">
            {type === "note" ? "Notebook" : "Parent notebook"}
          </span>
          <select
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            className="w-full rounded-sm border border-border bg-bg-subtle px-2 py-1.5 text-xs text-text-primary outline-none"
          >
            <option value="">Workspace root</option>
            {options.map((option) => (
              <option key={option.id} value={option.id} disabled={invalidDestinationIds.has(option.id)}>
                {"  ".repeat(option.depth)}{option.title}
              </option>
            ))}
          </select>
        </label>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-sm px-3 py-1.5 text-xs text-text-secondary hover:bg-bg-hover">Cancel</button>
          <button
            type="button"
            disabled={pending}
            onClick={() => void submit()}
            className="inline-flex items-center gap-1.5 rounded-sm bg-text-primary px-3 py-1.5 text-xs font-medium text-bg disabled:opacity-50"
          >
            <Copy size={12} />
            {pending ? "Copying…" : "Create copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
