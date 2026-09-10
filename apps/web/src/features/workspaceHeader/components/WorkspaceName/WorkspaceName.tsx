// import { useEffect, useState } from "react";

// interface Props { name: string; onRename: (name: string) => void; }

// export function WorkspaceName({ name, onRename }: Props) {
//   const [editing, setEditing] = useState(false);
//   const [value, setValue] = useState(name);

//   useEffect(() => setValue(name), [name]);

//   function commit() {
//     const next = value.trim();
//     setEditing(false);
//     if (!next || next === name) { setValue(name); return; }
//     onRename(next);
//   }

//   if (editing) {
//     return (
//       <input
//         autoFocus
//         value={value}
//         onChange={(e) => setValue(e.target.value)}
//         onBlur={commit}
//         onKeyDown={(e) => {
//           if (e.key === "Enter") commit();
//           if (e.key === "Escape") { setValue(name); setEditing(false); }
//         }}
//         className="mx-1 w-36 rounded-sm border border-accent bg-bg px-2 py-1 text-sm outline-none"
//         aria-label="Workspace name"
//       />
//     );
//   }

//   return (
//     <button
//       type="button"
//       title="Double-click to rename"
//       onDoubleClick={() => setEditing(true)}
//       className="mx-1 max-w-40 truncate rounded-sm px-2 py-1 text-sm font-medium text-text-primary hover:bg-bg-hover"
//     >
//       {name || "Workspace"}
//     </button>
//   );
// }


import { useEffect, useState } from "react";

interface Props {
  name: string;
  onRename: (name: string) => void;
}

export function WorkspaceName({
  name,
  onRename,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);

  useEffect(() => {
    setValue(name);
  }, [name]);

  function commit() {
    const next = value.trim();

    setEditing(false);

    if (!next || next === name) {
      setValue(name);
      return;
    }

    onRename(next);
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(event) =>
          setValue(event.target.value)
        }
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            commit();
          }

          if (event.key === "Escape") {
            setValue(name);
            setEditing(false);
          }
        }}
        aria-label="Workspace name"
        className="
          ml-1
          w-36
          rounded-sm
          border
          border-accent
          bg-bg
          px-2
          py-1
          text-sm
          text-text-primary
          outline-none
        "
      />
    );
  }

  return (
    <button
      type="button"
      title="Double-click to rename"
      onDoubleClick={() => setEditing(true)}
      className="
        ml-1
        max-w-44
        truncate
        rounded-sm
        px-2
        py-1
        text-sm
        font-medium
        text-text-primary
        hover:bg-bg-hover
      "
    >
      {name || "Workspace"}
    </button>
  );
}