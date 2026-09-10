import { useState } from "react";
import { Hash, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { IconButton } from "@components/ui/IconButton";
import { DropdownMenu, DropdownMenuItem } from "@components/ui/DropdownMenu";
import { ConfirmDialog } from "@components/ui/ConfirmDialog";
import { useCreateTag, useDeleteTag, useRenameTag, useTags } from "../../hooks/useTags";

interface Props {
  workspaceId: string;
}

export function TagsView({ workspaceId }: Props) {
  const { data: tags = [], isLoading } = useTags(workspaceId);
  const createTag = useCreateTag(workspaceId);
  const renameTag = useRenameTag(workspaceId);
  const deleteTag = useDeleteTag(workspaceId);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function submitNewTag() {
    const name = newName.trim();
    if (!name) return;
    await createTag.mutateAsync(name);
    setNewName("");
  }

  function startRename(id: string, name: string) {
    setEditingId(id);
    setEditingName(name);
  }

  async function commitRename() {
    if (!editingId) return;
    const name = editingName.trim();
    const current = tags.find((tag) => tag.id === editingId);
    setEditingId(null);
    if (!name || name === current?.name) return;
    await renameTag.mutateAsync({ id: editingId, name });
  }

  if (isLoading) {
    return <div className="p-4 text-xs text-text-muted">Loading tags…</div>;
  }

  return (
    <>
      <div className="p-2">
        <div className="mb-2 flex items-center gap-1">
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void submitNewTag();
            }}
            placeholder="New tag"
            className="min-w-0 flex-1 rounded-sm border border-border bg-bg-subtle px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
          />
          <IconButton title="Create tag" aria-label="Create tag" onClick={() => void submitNewTag()}>
            <Plus size={14} />
          </IconButton>
        </div>

        {tags.map((tag) => (
          <div key={tag.id} className="group flex h-8 items-center rounded-sm hover:bg-bg-hover">
            <Hash size={13} className="ml-2 mr-1.5 shrink-0 text-text-muted" />
            {editingId === tag.id ? (
              <input
                autoFocus
                value={editingName}
                onChange={(event) => setEditingName(event.target.value)}
                onBlur={() => void commitRename()}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void commitRename();
                  if (event.key === "Escape") setEditingId(null);
                }}
                className="min-w-0 flex-1 rounded-sm border border-accent bg-bg px-1 text-xs text-text-primary outline-none"
              />
            ) : (
              <span className="min-w-0 flex-1 truncate text-sm text-text-secondary">#{tag.name}</span>
            )}
            <span className="mr-1 text-xs text-text-muted">{tag._count?.notes ?? 0}</span>
            <DropdownMenu
              trigger={
                <IconButton title="Tag actions" aria-label="Tag actions">
                  <MoreHorizontal size={14} />
                </IconButton>
              }
            >
              <DropdownMenuItem onClick={() => startRename(tag.id, tag.name)}>Rename</DropdownMenuItem>
              <DropdownMenuItem danger onClick={() => setDeleteId(tag.id)} icon={<Trash2 size={13} />}>
                Delete tag
              </DropdownMenuItem>
            </DropdownMenu>
          </div>
        ))}

        {tags.length === 0 && (
          <div className="px-2 py-8 text-center text-xs text-text-muted">
            No tags yet
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete tag?"
        message="The tag will be removed from the workspace. Notes themselves will not be deleted."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteId) deleteTag.mutate(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
