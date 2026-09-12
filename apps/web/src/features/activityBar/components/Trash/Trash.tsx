import { Trash2 } from "lucide-react";
import { IconButton } from "@components/ui/IconButton";

interface Props {
  active?: boolean;
  onClick: () => void;
}

export function Trash({ active = false, onClick }: Props) {
  return (
    <IconButton title="Trash" aria-label="Trash" onClick={onClick} active={active}>
      <Trash2 size={17} strokeWidth={1.8} />
    </IconButton>
  );
}