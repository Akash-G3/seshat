
import { FileText, Folder, Star } from "lucide-react";
import type { Favourite } from "@features/favourites/types/favourite.types";
import { IconButton } from "@components/ui/IconButton";

interface Props {
  favourites: Favourite[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onRemoveFavourite: (type: "note" | "notebook", id: string) => void;
}

export function FavouritesView({
  favourites,
  activeNoteId,
  onSelectNote,
  onRemoveFavourite,
}: Props) {
  if (favourites.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <Star
          size={18}
          strokeWidth={1.6}
          className="mb-2 text-text-muted"
        />

        <p className="text-sm text-text-secondary">
          No favourites yet
        </p>

        <p className="mt-1 text-xs text-text-muted">
          Add notes or notebooks from their action menu.
        </p>
      </div>
    );
  }

  return (
    <div className="p-1.5">
      {favourites.map((item) => {
        const isNote = item.type === "note";
        const active = isNote && item.id === activeNoteId;

        return (
          <div
            key={`${item.type}:${item.id}`}
            className={`group flex h-8 items-center rounded-md text-sm transition-colors duration-150 ${
              active
                ? "bg-accent-subtle text-accent"
                : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
            }`}
          >
            <button
              type="button"
              onClick={
                isNote
                  ? () => onSelectNote(item.id)
                  : undefined
              }
              className={`flex min-w-0 flex-1 items-center gap-1.5 px-2 text-left ${
                !isNote ? "cursor-default" : ""
              }`}
            >
              {isNote ? (
                <FileText
                  size={13}
                  strokeWidth={1.7}
                  className="shrink-0"
                />
              ) : (
                <Folder
                  size={14}
                  strokeWidth={1.7}
                  className="shrink-0"
                />
              )}

              <span className="min-w-0 flex-1 truncate">
                {item.title || (isNote ? "Untitled" : "Notebook")}
              </span>
            </button>

            <div className="mr-1 opacity-0 group-hover:opacity-100">
              <IconButton
                title="Remove from favourites"
                aria-label="Remove from favourites"
                onClick={() =>
                  onRemoveFavourite(item.type, item.id)
                }
              >
                <Star
                  size={13}
                  strokeWidth={1.7}
                  fill="currentColor"
                />
              </IconButton>
            </div>
          </div>
        );
      })}
    </div>
  );
}