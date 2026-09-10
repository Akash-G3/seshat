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

export function ActivityBar({ libraryOpen, onCreateNote, onCreateNotebook, onSearch, onFavourites, onToggleLibrary, onTags, onTrash, onOpenLibrary }: Props) {
  return (
    <aside className="flex w-12 shrink-0 flex-col items-center border-r border-border bg-bg py-1">
      <div className="flex flex-col items-center gap-0.5">
        <CreateNote onClick={onCreateNote} />
        <CreateNotebook onClick={onCreateNotebook} />
        <Search onClick={onSearch} />
        <Library active={libraryOpen} onClick={onOpenLibrary} />
        <Favourites onClick={onFavourites} />
        <Tags onClick={onTags} />
        <Trash onClick={onTrash} />
        <FileToggle open={libraryOpen} onClick={onToggleLibrary} />
      </div>
      <div className="mt-auto"><Profile /></div>
    </aside>
  );
}
