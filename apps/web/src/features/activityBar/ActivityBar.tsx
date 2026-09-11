
//--UI redesign

import { CreateNote } from "./components/CreateNote/CreateNote";
import { CreateNotebook } from "./components/CreateNotebook/CreateNotebook";
import { Search } from "./components/Search/Search";
import { Favourites } from "./components/Favourites/Favourites";
import { FileToggle } from "./components/FileToggle/FileToggle";
import { Profile } from "./components/Profile/Profile";
import { Tags } from "./components/Tags/Tags";
import { Trash } from "./components/Trash/Trash";
import { Library } from "./components/Library/Library";

interface Props {
  libraryOpen: boolean;
  onCreateNote: () => void;
  onCreateNotebook: () => void;
  onSearch: () => void;
  onFavourites: () => void;
  onToggleLibrary: () => void;
  onTags: () => void;
  onTrash: () => void;
  onOpenLibrary: () => void;
}

function RailDivider() {
  return <div className="my-2 h-px w-6 shrink-0 bg-border" />;
}

export function ActivityBar({ libraryOpen, onCreateNote, onCreateNotebook, onSearch, onFavourites, onToggleLibrary, onTags, onTrash, onOpenLibrary }: Props) {
  return (
    <aside className="flex w-14 shrink-0 flex-col items-center border-r border-border bg-bg-subtle py-3">
      {/* Create — the two actions someone reaches for first */}
      <div className="flex flex-col items-center gap-1">
        <CreateNote onClick={onCreateNote} />
        <CreateNotebook onClick={onCreateNotebook} />
      </div>

      <RailDivider />

      {/* Navigate — panels that open in the library rail */}
      <div className="flex flex-col items-center gap-1">
        <Search onClick={onSearch} />
        <Library active={libraryOpen} onClick={onOpenLibrary} />
        <Favourites onClick={onFavourites} />
        <Tags onClick={onTags} />
        <Trash onClick={onTrash} />
      </div>

      <div className="mt-auto flex flex-col items-center gap-1">
        <FileToggle open={libraryOpen} onClick={onToggleLibrary} />
        <div className="my-1 h-px w-6 shrink-0 bg-border" />
        <Profile />
      </div>
    </aside>
  );
}