import type { Theme } from "@blocknote/mantine";

export const lightEditorTheme: Theme = {
  colors: {
    editor: { text: "#2B2926", background: "#F7F6F3" },
    menu: { text: "#2B2926", background: "#FFFFFF" },
    tooltip: { text: "#F7F6F3", background: "#2B2926" },
    hovered: { text: "#2B2926", background: "#E7E4DC" },
    selected: { text: "#FFFFFF", background: "#3D6B63" },
    disabled: { text: "#A19C8F", background: "#EFEDE7" },
    shadow: "#DEDAD0",
    border: "#DEDAD0",
    sideMenu: "#A19C8F",
  },
  borderRadius: 4,
  fontFamily: "Inter, system-ui, sans-serif",
};

export const darkEditorTheme: Theme = {
  colors: {
    editor: { text: "#EDEAE4", background: "#1E1C1A" },
    menu: { text: "#EDEAE4", background: "#262320" },
    tooltip: { text: "#1E1C1A", background: "#EDEAE4" },
    hovered: { text: "#EDEAE4", background: "#2E2A26" },
    selected: { text: "#1E1C1A", background: "#5C9188" },
    disabled: { text: "#746F63", background: "#262320" },
    shadow: "#3A362F",
    border: "#3A362F",
    sideMenu: "#746F63",
  },
  borderRadius: 4,
  fontFamily: "Inter, system-ui, sans-serif",
};