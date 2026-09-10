import { Library as LibraryIcon } from "lucide-react";
import { IconButton } from "@components/ui/IconButton";

interface Props {
  active?: boolean;
  onClick: () => void;
}

export function Library({ active = false, onClick }: Props) {
  return (
    <IconButton
      title="Library"
      aria-label="Library"
      onClick={onClick}
      className={active ? "bg-bg-hover text-text-primary" : undefined}
    >
      <LibraryIcon size={17} strokeWidth={1.8} />
    </IconButton>
  );
}
