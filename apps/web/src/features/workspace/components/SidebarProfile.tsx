import { useState, useRef, useEffect } from "react";
import { useLogout } from "@features/auth/useLogout";
import { useAuth } from "@app/AuthContext";
import { useTheme } from "@app/ThemeContext";
import { LogOut, Sun, Moon } from "lucide-react";

export function SidebarProfile() {
  const { workspace } = useAuth();
  const logout = useLogout();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const label = workspace?.name ?? "Workspace";

  return (
    <div ref={ref} className="relative border-t border-border p-2">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-medium text-white hover:opacity-90"
        aria-label="Open profile menu"
      >
        {label.charAt(0).toUpperCase()}
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-2 mb-2 w-48 overflow-hidden rounded-sm border border-border bg-bg shadow-md">
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-medium text-text-primary">{label}</p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-primary hover:bg-bg-subtle"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-bg-subtle"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}