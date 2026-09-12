import type { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
  footer: ReactNode;
}

/** Shared shell for Login/Signup — keeps the auth flow visually
 *  consistent with the rest of the app instead of default Tailwind grays. */
export function AuthLayout({ title, children, footer }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-subtle px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-base font-semibold text-bg">
            S
          </div>
          <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
        </div>

        <div className="rounded-lg border border-border bg-bg p-8 shadow-[var(--shadow-md)]">
          {children}
        </div>

        <div className="mt-6 text-center text-sm text-text-secondary">{footer}</div>
      </div>
    </div>
  );
}