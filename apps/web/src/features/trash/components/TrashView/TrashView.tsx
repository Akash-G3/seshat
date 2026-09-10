import { useMemo, useState } from "react";
import { FileText, Folder, RotateCcw, Trash2, X } from "lucide-react";
import { IconButton } from "@components/ui/IconButton";
import { ConfirmDialog } from "@components/ui/ConfirmDialog";
import { useEmptyTrash, usePermanentlyDelete, useRestoreFromTrash, useTrash } from "../../hooks/useTrash";

interface Props {
  workspaceId: string;
}

function formatDeletedAt(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function TrashView({ workspaceId }: Props) {
  const { data: items = [], isLoading } = useTrash(workspaceId);
  const restore = useRestoreFromTrash(workspaceId);
  const permanentlyDelete = usePermanentlyDelete(workspaceId);
  const empty = useEmptyTrash(workspaceId);
  const [pending, setPending] = useState<{ type: "item" | "empty"; id?: string; label?: string; itemType?: "note" | "notebook" } | null>(null);

  const visibleItems = useMemo(() => items, [items]);

  if (isLoading) {
    return <div className="p-4 text-xs text-text-muted">Loading trash…</div>;
  }

  return (
    <>
      <div className="p-2">
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs text-text-muted">{visibleItems.length} item{visibleItems.length === 1 ? "" : "s"}</span>
          {visibleItems.length > 0 && (
            <button
              type="button"
              onClick={() => setPending({ type: "empty" })}
              className="text-xs text-danger hover:underline"
            >
              Empty trash
            </button>
          )}
        </div>

        {visibleItems.map((item) => (
          <div key={`${item.type}:${item.id}`} className="group flex min-h-9 items-center rounded-sm px-1 hover:bg-bg-hover">
            {item.type === "note" ? (
              <FileText size={14} className="mx-1.5 shrink-0 text-text-muted" />
            ) : (
              <Folder size={14} className="mx-1.5 shrink-0 text-text-muted" />
            )}

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-text-secondary">{item.title || "Untitled"}</div>
              <div className="text-[10px] text-text-muted">{formatDeletedAt(item.deletedAt)}</div>
            </div>

            <div className="flex items-center opacity-0 group-hover:opacity-100">
              <IconButton
                title="Restore"
                aria-label={`Restore ${item.title}`}
                onClick={() => restore.mutate({ type: item.type, id: item.id })}
              >
                <RotateCcw size={13} />
              </IconButton>
              <IconButton
                title="Delete permanently"
                aria-label={`Delete ${item.title} permanently`}
                onClick={() => setPending({ type: "item", id: item.id, label: item.title, itemType: item.type })}
              >
                <X size={13} />
              </IconButton>
            </div>
          </div>
        ))}

        {visibleItems.length === 0 && (
          <div className="flex flex-col items-center px-4 py-12 text-center">
            <Trash2 size={18} className="mb-2 text-text-muted" strokeWidth={1.6} />
            <p className="text-sm text-text-secondary">Trash is empty</p>
            <p className="mt-1 text-xs text-text-muted">Deleted notes and notebooks will appear here.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={pending?.type === "item"}
        title="Delete permanently?"
        message={`“${pending?.label ?? "Item"}” cannot be restored after permanent deletion.`}
        confirmLabel="Delete permanently"
        onConfirm={() => {
          if (pending?.id && pending.itemType) {
            permanentlyDelete.mutate({ type: pending.itemType, id: pending.id });
          }
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />

      <ConfirmDialog
        open={pending?.type === "empty"}
        title="Empty trash?"
        message="Every item currently in Trash will be permanently deleted."
        confirmLabel="Empty trash"
        onConfirm={() => {
          empty.mutate();
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
