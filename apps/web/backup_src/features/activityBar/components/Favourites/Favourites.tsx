import { Star } from "lucide-react";
import { IconButton } from "@components/ui/IconButton";

export function Favourites({ onClick }: { onClick: () => void }) {
  return <IconButton title="Favourites" aria-label="Favourites" onClick={onClick}><Star size={17} strokeWidth={1.8} /></IconButton>;
}
