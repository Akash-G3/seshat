import { LogOut, Moon, Settings, Sun, UserRound, KeyRound } from "lucide-react";
import { DropdownMenu, DropdownMenuItem } from "@components/ui/DropdownMenu";
import { IconButton } from "@components/ui/IconButton";
import { useTheme } from "@app/ThemeContext";
import { useLogout } from "@features/auth/useLogout";

export function Profile() {
  const { theme, toggleTheme } = useTheme();
  const logout = useLogout();

  return (
    <DropdownMenu
      align="left"
      side="top"
      trigger={<IconButton title="Profile" aria-label="Profile"><UserRound size={17} strokeWidth={1.8} /></IconButton>}
    >
      <div className="border-b border-border px-3 py-2">
        <p className="text-sm font-medium text-text-primary">Profile</p>
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
