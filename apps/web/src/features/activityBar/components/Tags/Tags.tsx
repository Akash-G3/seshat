import { Tags as TagsIcon } from "lucide-react";
import { IconButton } from "@components/ui/IconButton";

export function Tags({ onClick }: { onClick: () => void }) {
  return <IconButton title="Tags" aria-label="Tags" onClick={onClick}><TagsIcon size={17} strokeWidth={1.8} /></IconButton>;
}
