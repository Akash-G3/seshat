import { useState } from "react";
import { Plus, Notebook, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/DropdownMenu";
import { IconButton } from "@/components/ui/IconButton";
import { useRenameWorkspace } from "@features/workspace/hooks/useWorkspaceMutations";
import { SIDEBAR_WIDTH } from "@features/workspace/constants";

interface Props {
  workspaceName: string;
  onNewNotebook: () => void;
  onNewNote: () => void;
}

export function TopBarLeft({ workspaceName, onNewNotebook, onNewNote }: Props) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draft, setDraft] = useState(workspaceName);
  const renameWorkspace = useRenameWorkspace();

  function commitRename() {
    setIsRenaming(false);
    const trimmed = draft.trim();
    if (!trimmed || trimmed === workspaceName) {
      setDraft(workspaceName);
      return;
    }
    renameWorkspace.mutate(trimmed);
  }

  return (
    <div
      style={{ width: SIDEBAR_WIDTH }}
      className="h-12 flex items-center justify-between gap-2 px-3 border-b border-border bg-bg-subtle shrink-0"
    >
      {isRenaming ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") {
              setDraft(workspaceName);
              setIsRenaming(false);
            }
          }}
          className="flex-1 min-w-0 text-sm font-semibold bg-bg text-text-primary border border-accent rounded-sm px-1 outline-none"
        />
      ) : (
        <span
          onDoubleClick={() => setIsRenaming(true)}
          className="flex-1 min-w-0 truncate text-sm font-semibold text-text-primary"
          title="Double-click to rename"
        >
          {workspaceName}
        </span>
      )}

      <DropdownMenu trigger={<IconButton title="Create"><Plus size={16} /></IconButton>}>
        <DropdownMenuItem onClick={onNewNotebook}>
          <span className="flex items-center gap-2">
            <Notebook size={14} /> New notebook
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onNewNote}>
          <span className="flex items-center gap-2">
            <FileText size={14} /> New note
          </span>
        </DropdownMenuItem>
      </DropdownMenu>
    </div>
  );
}