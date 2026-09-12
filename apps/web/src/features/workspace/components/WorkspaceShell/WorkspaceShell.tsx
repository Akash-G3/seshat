import type { ReactNode } from "react";

interface WorkspaceShellProps {
  activityBar: ReactNode;
  library?: ReactNode;
  header: ReactNode;
  content: ReactNode;
}

/**
 * Layout-only shell.
 * It deliberately knows nothing about notes or backend data.
 */
export function WorkspaceShell({
  activityBar,
  library,
  header,
  content,
}: WorkspaceShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg text-text-primary">
      {/* Fixed top-level workspace header */}
      {header}

      {/* Workspace body */}
      <div className="flex min-h-0 flex-1">
        {/* Slim vertical activity bar */}
        {activityBar}

        {/* Library / navigation panel */}
        {library}

        {/* Main editor area */}
        <main className="min-w-0 min-h-0 flex-1 overflow-hidden">
          {content}
        </main>
      </div>
    </div>
  );
}

