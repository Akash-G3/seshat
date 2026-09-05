import { useCallback, useRef, useState } from "react";

export function useNavigationHistory(onNavigate: (noteId: string) => void) {
  const stack = useRef<string[]>([]);
  const pointer = useRef(-1);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const sync = () => {
    setCanGoBack(pointer.current > 0);
    setCanGoForward(pointer.current < stack.current.length - 1);
  };

  const push = useCallback((noteId: string) => {
    if (stack.current[pointer.current] === noteId) return;
    stack.current = stack.current.slice(0, pointer.current + 1);
    stack.current.push(noteId);
    pointer.current = stack.current.length - 1;
    sync();
  }, []);

  const back = useCallback(() => {
    if (pointer.current <= 0) return;
    pointer.current -= 1;
    onNavigate(stack.current[pointer.current]);
    sync();
  }, [onNavigate]);

  const forward = useCallback(() => {
    if (pointer.current >= stack.current.length - 1) return;
    pointer.current += 1;
    onNavigate(stack.current[pointer.current]);
    sync();
  }, [onNavigate]);

  return { push, back, forward, canGoBack, canGoForward };
}