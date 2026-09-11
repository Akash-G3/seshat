
//--UI redesign

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

// A small square button for icon-only actions (rename, delete, add).
// Consumers can hide this button on hover when an action should stay visually quiet.
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "danger";
  /** Persistent "on" state (e.g. the currently open panel) — a soft accent pill, not just a hover tint. */
  active?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = "default", active = false, className = "", ...props }, ref) => {
    const variantClass =
      variant === "danger"
        ? "text-text-secondary hover:bg-danger-subtle hover:text-danger"
        : active
          ? "bg-accent-subtle text-accent"
          : "text-text-secondary hover:bg-bg-hover hover:text-text-primary";

    return (
      <button
        ref={ref}
        type="button"
        className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-150 ${variantClass} ${className}`}
        {...props}
      />
    );
  }
);
IconButton.displayName = "IconButton";