import { useWorkspaceTree } from "../hooks/useWorkspaceTree";

export function Sidebar() {
  const { workspace, tree, isLoading, isError } = useWorkspaceTree();

  if (isLoading) return <div className="p-4 text-sm text-gray-400">Loading…</div>;
  if (isError || !tree) return <div className="p-4 text-sm text-red-500">Failed to load workspace</div>;

  return (
    <aside className="w-64 border-r h-full overflow-y-auto p-2">
      <div className="font-semibold text-sm px-2 py-2">{workspace?.name}</div>

      {tree.notebooks.map((notebook) => (
        <div key={notebook.id} className="mb-2">
          <div className="font-medium text-sm px-2 py-1 text-gray-700">{notebook.title}</div>
          {notebook.notes.map((note) => (
            <div key={note.id} className="px-4 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
              {note.title || "Untitled"}
            </div>
          ))}
        </div>
      ))}

      {tree.unfiledNotes.length > 0 && (
        <div className="mt-4">
          <div className="font-medium text-sm px-2 py-1 text-gray-500">Notes</div>
          {tree.unfiledNotes.map((note) => (
            <div key={note.id} className="px-4 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
              {note.title || "Untitled"}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}