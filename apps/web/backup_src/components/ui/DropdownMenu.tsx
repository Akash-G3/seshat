import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "left" | "right";
  side?: "top" | "bottom";
}

/** Small dependency-free menu. Supports both normal and externally controlled opening. */
export function DropdownMenu({ trigger, children, open: controlledOpen, onOpenChange, align = "right", side = "bottom" }: DropdownMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const ref = useRef<HTMLDivElement>(null);

  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [controlledOpen]);

  const position = side === "top" ? "bottom-full mb-1" : "top-full mt-1";
  const alignment = align === "left" ? "left-0" : "right-0";

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div className={`absolute ${alignment} ${position} z-50 min-w-[170px] overflow-hidden rounded-md border border-border bg-bg py-1 shadow-lg`} onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({ onClick, danger, icon, children }: { onClick: () => void; danger?: boolean; icon?: ReactNode; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors ${danger ? "text-danger hover:bg-danger-subtle" : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
