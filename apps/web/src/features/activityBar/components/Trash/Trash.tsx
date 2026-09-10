import { Trash2 } from "lucide-react";
import { IconButton } from "@components/ui/IconButton";

export function Trash({ onClick }: { onClick: () => void }) {
  return <IconButton title="Trash" aria-label="Trash" onClick={onClick}><Trash2 size={17} strokeWidth={1.8} /></IconButton>;
}
