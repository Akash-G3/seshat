
import { Copy, Download, Link, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuItem } from "@components/ui/DropdownMenu";
import { IconButton } from "@components/ui/IconButton";

interface Props {
  onShare: () => void;
  onCopy: () => void;
  onExport: () => void;
}

export function NoteActions({ onShare, onCopy, onExport }: Props) {
  return (
    <DropdownMenu
      align="right"
      trigger={
        <IconButton aria-label="Note actions">
          <MoreHorizontal size={15} />
        </IconButton>
      }
    >
      <DropdownMenuItem onClick={onShare} icon={<Link size={13} />}>
        Share
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onCopy} icon={<Copy size={13} />}>
        Copy
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onExport} icon={<Download size={13} />}>
        Export
      </DropdownMenuItem>
    </DropdownMenu>
  );
}