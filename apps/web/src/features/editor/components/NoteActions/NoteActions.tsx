import { Copy, Download, Link } from "lucide-react";

interface Props {
  onShare: () => void;
  onCopy: () => void;
  onExport: () => void;
}

export function NoteActions({ onShare, onCopy, onExport }: Props) {
  return (
    <div className="flex items-center gap-0.5">
      <button type="button" onClick={onShare} className="inline-flex h-7 items-center gap-1.5 rounded-sm px-2 text-xs text-text-muted hover:bg-bg-hover hover:text-text-primary">
        <Link size={13} />
        Share
      </button>
      <button type="button" onClick={onCopy} className="inline-flex h-7 items-center gap-1.5 rounded-sm px-2 text-xs text-text-muted hover:bg-bg-hover hover:text-text-primary">
        <Copy size={13} />
        Copy
      </button>
      <button type="button" onClick={onExport} className="inline-flex h-7 items-center gap-1.5 rounded-sm px-2 text-xs text-text-muted hover:bg-bg-hover hover:text-text-primary">
        <Download size={13} />
        Export
      </button>
    </div>
  );
}
