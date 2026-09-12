import { Tags as TagsIcon } from "lucide-react";
import { IconButton } from "@components/ui/IconButton";

interface Props {
  active?: boolean;
  onClick: () => void;
}

export function Tags({ active = false, onClick }: Props) {
  return (
    <IconButton title="Tags" aria-label="Tags" onClick={onClick} active={active}>
      <TagsIcon size={17} strokeWidth={1.8} />
    </IconButton>
  );
}