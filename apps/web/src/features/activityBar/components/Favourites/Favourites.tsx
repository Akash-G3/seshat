import { Star } from "lucide-react";
import { IconButton } from "@components/ui/IconButton";

interface Props {
  active?: boolean;
  onClick: () => void;
}

export function Favourites({ active = false, onClick }: Props) {
  return (
    <IconButton title="Favourites" aria-label="Favourites" onClick={onClick} active={active}>
      <Star size={17} strokeWidth={1.8} />
    </IconButton>
  );
}