import { ChevronLeft, ChevronRight } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";

interface Props {
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
}

export function NavHistoryControls({ canGoBack, canGoForward, onBack, onForward }: Props) {
  return (
    <div className="flex items-center gap-0.5">
      <IconButton title="Go back" disabled={!canGoBack} onClick={onBack} className="disabled:opacity-30 disabled:hover:bg-transparent">
        <ChevronLeft size={16} />
      </IconButton>
      <IconButton title="Go forward" disabled={!canGoForward} onClick={onForward} className="disabled:opacity-30 disabled:hover:bg-transparent">
        <ChevronRight size={16} />
      </IconButton>
    </div>
  );
}