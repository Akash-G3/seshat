import { PanelLeft } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export function SidebarToggleButton({ collapsed, onToggle }: Props) {
  return (
    <IconButton title={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={onToggle}>
      <PanelLeft size={16} />
    </IconButton>
  );
}