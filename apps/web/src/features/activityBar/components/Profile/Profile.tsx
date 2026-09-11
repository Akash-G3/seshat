
//--UI redesign
import { LogOut, Moon, Settings, Sun, KeyRound } from "lucide-react";
import { DropdownMenu, DropdownMenuItem } from "@components/ui/DropdownMenu";
import { useTheme } from "@app/ThemeContext";
import { useLogout } from "@features/auth/useLogout";
import { useAuth } from "@app/AuthContext";

export function Profile() {
  const { theme, toggleTheme } = useTheme();
  const logout = useLogout();
  const { workspace } = useAuth();

  const initial = workspace?.name?.trim()?.[0]?.toUpperCase() ?? "?";

  return (
    <DropdownMenu
      align="left"
      side="top"
      trigger={
        <button
          type="button"
          title="Profile"
          aria-label="Profile"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-medium text-bg transition-opacity duration-150 hover:opacity-85"
        >
          {initial}
        </button>
      }
    >
      <div className="border-b border-border px-3 py-2">
        <p className="truncate text-sm font-medium text-text-primary">{workspace?.name ?? "Workspace"}</p>
        <p className="text-xs text-text-muted">Account</p>
      </div>
      <DropdownMenuItem onClick={() => {}} icon={<Settings size={14} />}>Settings</DropdownMenuItem>
      <DropdownMenuItem onClick={() => {}} icon={<KeyRound size={14} />}>Change password</DropdownMenuItem>
      <DropdownMenuItem onClick={toggleTheme} icon={theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}>
        {theme === "dark" ? "Light theme" : "Dark theme"}
      </DropdownMenuItem>
      <DropdownMenuItem danger onClick={() => { void logout(); }} icon={<LogOut size={14} />}>Log out</DropdownMenuItem>
    </DropdownMenu>
  );
}