import { useMemo, useState } from "react";
import { Plus, Tag as TagIcon, X } from "lucide-react";
import { useCreateTag, useAttachTag, useDetachTag, useNoteTags, useTags } from "../../hooks/useTags";
import { IconButton } from "@components/ui/IconButton";

interface Props {
  noteId: string;
  workspaceId: string;
}

export function TagPicker({ noteId, workspaceId }: Props) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const { data: allTags = [] } = useTags(workspaceId);
  const { data: noteTags = [] } = useNoteTags(noteId);
  const createTag = useCreateTag(workspaceId);
  const attachTag = useAttachTag(noteId, workspaceId);
  const detachTag = useDetachTag(noteId, workspaceId);

  const attached = useMemo(() => new Set(noteTags.map((tag) => tag.id)), [noteTags]);
  const available = allTags.filter((tag) => !attached.has(tag.id));

  async function createAndAttach() {
    const name = newName.trim();
    if (!name) return;
    try {
      const tag = await createTag.mutateAsync(name);
      await attachTag.mutateAsync(tag.id);
      setNewName("");
      setOpen(false);
    } catch {
      // Global API error handling remains responsible for surfacing request errors.
    }
  }

  return (
    <div className="relative border-b border-border bg-bg px-8 py-2">
      <div className="flex min-h-7 items-center gap-1.5">
        <TagIcon size={13} className="shrink-0 text-text-muted" />
        {noteTags.map((tag) => (
          <span
            key={tag.id}
            className="group inline-flex items-center gap-1 rounded-sm bg-accent-subtle px-1.5 py-0.5 text-xs text-accent"
          >
            #{tag.name}
            <button
              type="button"
              aria-label={`Remove ${tag.name}`}
              onClick={() => detachTag.mutate(tag.id)}
              className="opacity-60 hover:opacity-100"
            >
              <X size={11} />
            </button>
          </span>
        ))}

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs text-text-muted hover:bg-bg-hover hover:text-text-primary"
          >
            <Plus size={12} />
            Add tag
          </button>

          {open && (
            <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-md border border-border bg-bg p-2 shadow-lg">
              <input
                autoFocus
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void createAndAttach();
                  if (event.key === "Escape") setOpen(false);
                }}
                placeholder="Create or find a tag"
                className="mb-2 w-full rounded-sm border border-border bg-bg-subtle px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent"
              />
              <div className="max-h-40 overflow-y-auto">
                {available.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      attachTag.mutate(tag.id);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                  >
                    <span>#{tag.name}</span>
                    <span className="text-text-muted">{tag._count?.notes ?? 0}</span>
                  </button>
                ))}
                {available.length === 0 && (
                  <p className="px-2 py-1 text-xs text-text-muted">No existing tags</p>
                )}
              </div>
              {newName.trim() && !available.some((tag) => tag.name.toLowerCase() === newName.trim().toLowerCase()) && (
                <button
                  type="button"
                  onClick={() => void createAndAttach()}
                  className="mt-1 flex w-full items-center gap-1.5 rounded-sm border-t border-border px-2 pt-2 text-left text-xs text-accent hover:text-text-primary"
                >
                  <Plus size={12} />
                  Create “{newName.trim()}”
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
