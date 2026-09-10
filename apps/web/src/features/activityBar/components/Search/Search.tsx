import { Search as SearchIcon } from "lucide-react";
import { IconButton } from "@components/ui/IconButton";

export function Search({ onClick }: { onClick: () => void }) {
  return <IconButton title="Search" aria-label="Search" onClick={onClick}><SearchIcon size={17} strokeWidth={1.8} /></IconButton>;
}
