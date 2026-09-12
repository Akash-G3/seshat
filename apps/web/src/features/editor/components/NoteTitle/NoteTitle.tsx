import { useEffect, useRef, useState } from "react";

interface Props {
  title: string;
  onRename: (title: string) => void;
}

/** Large in-document title, editable inline — commits on blur/Enter, matching the
 *  rename pattern used for notes/notebooks elsewhere in the sidebar. */
export function NoteTitle({ title, onRename }: Props) {
  const [value, setValue] = useState(title);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setValue(title);
  }, [title]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  function commit() {
    const next = value.trim();
    if (!next || next === title) {
      setValue(title);
      return;
    }
    onRename(next);
  }

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          ref.current?.blur();
        }
        if (event.key === "Escape") {
          setValue(title);
          ref.current?.blur();
        }
      }}
      placeholder="Untitled"
      aria-label="Note title"
      className="w-full resize-none overflow-hidden bg-transparent text-3xl font-semibold leading-tight text-text-primary outline-none placeholder:text-text-muted"
    />
  );
}