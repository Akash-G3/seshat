import { FilePlus2 } from "lucide-react";
import { IconButton } from "@components/ui/IconButton";

export function CreateNote({ onClick }: { onClick: () => void }) {
  return <IconButton title="Create note" aria-label="Create note" onClick={onClick}><FilePlus2 size={17} strokeWidth={1.8} /></IconButton>;
}
