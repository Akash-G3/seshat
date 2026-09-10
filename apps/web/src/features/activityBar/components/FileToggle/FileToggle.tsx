import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { IconButton } from "@components/ui/IconButton";

export function FileToggle({ open, onClick }: { open: boolean; onClick: () => void }) {
  return <IconButton title={open ? "Collapse library" : "Expand library"} aria-label={open ? "Collapse library" : "Expand library"} onClick={onClick}>{open ? <PanelLeftClose size={17} strokeWidth={1.8} /> : <PanelLeftOpen size={17} strokeWidth={1.8} />}</IconButton>;
}
