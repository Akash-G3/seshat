import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

// Minimal dropdown menu — no external dependency (Radix etc.) since our needs
// are simple: a trigger, a floating panel, click-outside-to-close.
interface DropdownMenuProps {
  trigger: ReactNode;
  children: ReactNode;
}

export function DropdownMenu({ trigger, children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking anywhere outside the menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 min-w-[160px] bg-bg border border-border rounded-md shadow-sm py-1 z-50"
          onClick={() => setOpen(false)} // any item click closes the menu
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({
  onClick,
  danger,
  children,
}: {
  onClick: () => void;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-1.5 text-sm transition-colors ${
        danger ? "text-danger hover:bg-danger-subtle" : "text-text-primary hover:bg-bg-hover"
      }`}
    >
      {children}
    </button>
  );
}