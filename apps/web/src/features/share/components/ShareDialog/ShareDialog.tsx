import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Link, ShieldOff, X } from "lucide-react";
import { useCreateShareLink, useRevokeShareLink, useShareLinks } from "../../hooks/useShareLinks";

interface Props {
  open: boolean;
  type: "note" | "notebook";
  id: string;
  title: string;
  onClose: () => void;
}

function expiryDate(value: string) {
  if (value === "never") return undefined;
  const date = new Date();
  date.setDate(date.getDate() + Number(value));
  return date.toISOString();
}

export function ShareDialog({ open, type, id, title, onClose }: Props) {
  const [expiry, setExpiry] = useState("never");
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: links = [] } = useShareLinks();
  const create = useCreateShareLink();
  const revoke = useRevokeShareLink();

  const currentLinks = useMemo(
    () => links.filter((link) => (type === "note" ? link.noteId === id : link.notebookId === id)),
    [links, type, id],
  );

  useEffect(() => {
    if (!open) {
      setCreatedUrl(null);
      setCopied(false);
    }
  }, [open]);

  if (!open) return null;

  async function createLink() {
    const result = await create.mutateAsync({
      type,
      id,
      ...(expiryDate(expiry) ? { expiresAt: expiryDate(expiry) } : {}),
    });
    const url = `${window.location.origin}/share/${result.token}`;
    setCreatedUrl(url);
    await copy(url);
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4" onMouseDown={onClose}>
      <div
        className="w-full max-w-md rounded-md border border-border bg-bg p-5 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Share {type}</h2>
            <p className="mt-1 max-w-sm truncate text-xs text-text-muted">{title}</p>
          </div>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-primary" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {createdUrl && (
          <div className="mb-4 rounded-md border border-accent bg-accent-subtle p-3">
            <p className="mb-2 text-xs text-text-secondary">Anyone with this link can view it.</p>
            <div className="flex gap-2">
              <input readOnly value={createdUrl} className="min-w-0 flex-1 rounded-sm border border-border bg-bg px-2 py-1.5 text-xs text-text-primary outline-none" />
              <button
                type="button"
                onClick={() => void copy(createdUrl)}
                className="inline-flex items-center gap-1 rounded-sm bg-accent px-2 py-1.5 text-xs text-white"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-text-secondary">Link expiry</label>
          <select
            value={expiry}
            onChange={(event) => setExpiry(event.target.value)}
            className="w-full rounded-sm border border-border bg-bg-subtle px-2 py-1.5 text-xs text-text-primary outline-none"
          >
            <option value="never">Never</option>
            <option value="1">In 1 day</option>
            <option value="7">In 7 days</option>
            <option value="30">In 30 days</option>
          </select>
        </div>

        <button
          type="button"
          disabled={create.isPending}
          onClick={() => void createLink()}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-sm bg-text-primary px-3 py-2 text-xs font-medium text-bg disabled:opacity-50"
        >
          <Link size={13} />
          {create.isPending ? "Creating…" : "Create share link"}
        </button>

        {currentLinks.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="mb-2 text-xs font-medium text-text-secondary">Active links</p>
            {currentLinks.map((link) => (
              <div key={link.id} className="flex items-center justify-between gap-2 py-1.5">
                <div className="min-w-0 text-xs text-text-muted">
                  {link.expiresAt ? `Expires ${new Date(link.expiresAt).toLocaleDateString()}` : "Never expires"}
                </div>
                <button
                  type="button"
                  onClick={() => revoke.mutate(link.id)}
                  className="inline-flex shrink-0 items-center gap-1 text-xs text-danger hover:underline"
                >
                  <ShieldOff size={12} />
                  Revoke
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
