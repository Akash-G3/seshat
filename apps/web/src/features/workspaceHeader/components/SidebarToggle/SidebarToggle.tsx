// import { PanelLeft } from "lucide-react";
// import { IconButton } from "@components/ui/IconButton";

// export function SidebarToggle({ onClick }: { onClick: () => void }) {
//   return (
//     <IconButton title="Toggle library" aria-label="Toggle library" onClick={onClick}>
//       <PanelLeft size={16} strokeWidth={1.8} />
//     </IconButton>
//   );
// }

import { PanelLeft } from "lucide-react";
import { IconButton } from "@components/ui/IconButton";

interface Props {
  onClick: () => void;
}

export function SidebarToggle({ onClick }: Props) {
  return (
    <IconButton
      title="Toggle library"
      aria-label="Toggle library"
      onClick={onClick}
      className="ml-1"
    >
      <PanelLeft
        size={16}
        strokeWidth={1.7}
      />
    </IconButton>
  );
}