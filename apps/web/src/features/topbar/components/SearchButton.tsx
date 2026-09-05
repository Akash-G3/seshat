import { Search } from "lucide-react";

interface Props {
  onClick: () => void;
}

export function SearchButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-2.5 h-[28px] rounded-sm border border-border text-text-secondary hover:bg-bg-hover hover:text-text-primary text-sm transition-colors"
    >
      <Search size={14} />
      <span>Search</span>
      <kbd className="ml-1 text-xs text-text-muted bg-bg-subtle px-1 rounded-sm border border-border">Ctrl K</kbd>
    </button>
  );
}