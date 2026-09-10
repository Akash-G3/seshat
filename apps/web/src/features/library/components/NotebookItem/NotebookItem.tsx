import { useState } from "react";
import { ChevronDown, ChevronRight, Folder, MoreHorizontal, Plus } from "lucide-react";
import { DropdownMenu, DropdownMenuItem } from "@components/ui/DropdownMenu";
import { IconButton } from "@components/ui/IconButton";
import { NoteItem } from "../NoteItem/NoteItem";
import type { NoteSummary, NotebookNode } from "@features/workspace/types/workspace.types";

interface Props {
  notebook: NotebookNode;
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: (notebookId: string, title: string) => void;
  onCreateNotebook: (parentId: string, title: string) => void;
  onRenameNotebook: (id: string, title: string) => void;
  onDeleteNotebook: (id: string) => void;
  onRenameNote: (id: string, title: string) => void;
  onDeleteNote: (id: string) => void;
}

export function NotebookItem(props: Props) {
  const {
    notebook,
    activeNoteId,
    onSelectNote,
    onCreateNote,
    onCreateNotebook,
    onRenameNotebook,
    onDeleteNotebook,
    onRenameNote,
    onDeleteNote,
  } = props;

  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(notebook.title);
  const [newNote, setNewNote] = useState(false);
  const [newNotebook, setNewNotebook] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function commitRename() {
    const next = value.trim();
    setEditing(false);
    if (!next || next === notebook.title) {
      setValue(notebook.title);
      return;
    }
    onRenameNotebook(notebook.id, next);
  }

  function commitCreateNote() {
    const title = newTitle.trim();
    setNewNote(false);
    setNewTitle("");
    if (title) onCreateNote(notebook.id, title);
  }

  function commitCreateNotebook() {
    const title = newTitle.trim();
    setNewNotebook(false);
    setNewTitle("");
    if (title) onCreateNotebook(notebook.id, title);
  }

  function cancelInlineCreate() {
    setNewNote(false);
    setNewNotebook(false);
    setNewTitle("");
  }

  const startNewNote = () => {
    setExpanded(true);
    setNewNotebook(false);
    setNewTitle("");
    setNewNote(true);
  };

  const startNewNotebook = () => {
    setExpanded(true);
    setNewNote(false);
    setNewTitle("");
    setNewNotebook(true);
  };

  return (
    <div>
      <div
        className="group flex h-8 items-center rounded-sm hover:bg-bg-hover"
        onDoubleClick={(event) => {
          event.stopPropagation();
          setMenuOpen(true);
        }}
      >
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex h-6 w-6 shrink-0 items-center justify-center text-text-muted hover:text-text-primary"
          aria-label={expanded ? "Collapse notebook" : "Expand notebook"}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <Folder size={14} className="mr-1.5 shrink-0 text-text-muted" strokeWidth={1.7} />

        {editing ? (
          <input
            autoFocus
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onBlur={commitRename}
            onKeyDown={(event) => {
              if (event.key === "Enter") commitRename();
              if (event.key === "Escape") {
                setValue(notebook.title);
                setEditing(false);
              }
            }}
            className="min-w-0 flex-1 rounded-sm border border-accent bg-bg px-1 text-sm text-text-primary outline-none"
          />
        ) : (
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">
            {notebook.title}
          </span>
        )}

        <div className={`mr-1 flex items-center ${menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          <IconButton title="New note" aria-label="New note" onClick={startNewNote}>
            <Plus size={14} />
          </IconButton>

          <DropdownMenu
            open={menuOpen}
            onOpenChange={setMenuOpen}
            trigger={
              <IconButton title="Notebook actions" aria-label="Notebook actions">
                <MoreHorizontal size={14} />
              </IconButton>
            }
          >
            <DropdownMenuItem onClick={() => setEditing(true)}>Rename</DropdownMenuItem>
            <DropdownMenuItem onClick={startNewNote}>New note</DropdownMenuItem>
            <DropdownMenuItem onClick={startNewNotebook}>New notebook</DropdownMenuItem>
            <DropdownMenuItem danger onClick={() => onDeleteNotebook(notebook.id)}>Delete</DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>

      {expanded && (
        <div className="ml-3 border-l border-border pl-3">
          {newNotebook && (
            <div className="flex h-8 items-center">
              <input
                autoFocus
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                onBlur={commitCreateNotebook}
                onKeyDown={(event) => {
                  if (event.key === "Enter") commitCreateNotebook();
                  if (event.key === "Escape") cancelInlineCreate();
                }}
                placeholder="Notebook name"
                className="min-w-0 flex-1 rounded-sm border border-accent bg-bg px-1 text-sm outline-none"
              />
            </div>
          )}

          {newNote && (
            <div className="flex h-8 items-center">
              <input
                autoFocus
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                onBlur={commitCreateNote}
                onKeyDown={(event) => {
                  if (event.key === "Enter") commitCreateNote();
                  if (event.key === "Escape") cancelInlineCreate();
                }}
                placeholder="Note title"
                className="min-w-0 flex-1 rounded-sm border border-accent bg-bg px-1 text-sm outline-none"
              />
            </div>
          )}

          {notebook.children.map((child) => (
            <NotebookItem key={child.id} {...props} notebook={child} />
          ))}

          {notebook.notes.map((note: NoteSummary) => (
            <NoteItem
              key={note.id}
              note={note}
              active={note.id === activeNoteId}
              onSelect={() => onSelectNote(note.id)}
              onRename={onRenameNote}
              onDelete={() => onDeleteNote(note.id)}
            />
          ))}

          {notebook.children.length === 0 && notebook.notes.length === 0 && !newNote && !newNotebook && (
            <div className="px-2 py-1 text-xs text-text-muted">Empty notebook</div>
          )}
        </div>
      )}
    </div>
  );
}
