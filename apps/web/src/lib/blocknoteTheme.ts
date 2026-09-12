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
  borderRadius: 6,
  fontFamily: "Inter, system-ui, sans-serif",
};
export const darkEditorTheme: Theme = {
  colors: {
    editor: { text: "#FAF9F6", background: "#171614" },
    menu: { text: "#FAF9F6", background: "#262624" },
    tooltip: { text: "#171614", background: "#FAF9F6" },
    hovered: { text: "#FAF9F6", background: "#2E2C29" },
    selected: { text: "#171614", background: "#D8D3C7" },
    disabled: { text: "#75726C", background: "#1A1918" },
    shadow: "#3C3B38",
    border: "#3C3B38",
    sideMenu: "#75726C",
  },
  borderRadius: 6,
  fontFamily: "Inter, system-ui, sans-serif",
};