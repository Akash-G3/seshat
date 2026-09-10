import { Download, FileJson, FileText, X } from "lucide-react";
import { useExportNote } from "../../hooks/useExportMutations";

interface Props {
  open: boolean;
  noteId: string;
  title: string;
  onClose: () => void;
}

export function ExportDialog({ open, noteId, title, onClose }: Props) {
  const exportNote = useExportNote();

  if (!open) return null;

  async function run(format: "md" | "json") {
    await exportNote.mutateAsync({ noteId, format });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4" onMouseDown={onClose}>
      <div className="w-full max-w-sm rounded-md border border-border bg-bg p-5 shadow-xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Export note</h2>
            <p className="mt-1 truncate text-xs text-text-muted">{title}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-text-muted hover:text-text-primary"><X size={16} /></button>
        </div>

        <div className="space-y-2">
          <button type="button" disabled={exportNote.isPending} onClick={() => void run("md")} className="flex w-full items-center gap-3 rounded-md border border-border p-3 text-left hover:bg-bg-hover disabled:opacity-50">
            <FileText size={16} className="text-text-muted" />
            <span className="flex-1"><span className="block text-xs font-medium text-text-primary">Markdown</span><span className="block text-[11px] text-text-muted">Readable plain-text document</span></span>
            <Download size={13} className="text-text-muted" />
          </button>
          <button type="button" disabled={exportNote.isPending} onClick={() => void run("json")} className="flex w-full items-center gap-3 rounded-md border border-border p-3 text-left hover:bg-bg-hover disabled:opacity-50">
            <FileJson size={16} className="text-text-muted" />
            <span className="flex-1"><span className="block text-xs font-medium text-text-primary">JSON</span><span className="block text-[11px] text-text-muted">Portable Seshat note data</span></span>
            <Download size={13} className="text-text-muted" />
          </button>
        </div>
      </div>
    </div>
  );
}
