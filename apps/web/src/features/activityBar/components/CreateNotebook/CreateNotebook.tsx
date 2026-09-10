import { FolderPlus } from "lucide-react";
import { IconButton } from "@components/ui/IconButton";

export function CreateNotebook({ onClick }: { onClick: () => void }) {
  return <IconButton title="Create notebook" aria-label="Create notebook" onClick={onClick}><FolderPlus size={17} strokeWidth={1.8} /></IconButton>;
}
