import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

// A small square button for icon-only actions (rename, delete, add).
// Consumers can hide this button on hover when an action should stay visually quiet.
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "danger";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = "default", className = "", ...props }, ref) => {
    const variantClass =
      variant === "danger"
        ? "hover:bg-danger-subtle hover:text-danger"
        : "hover:bg-bg-hover text-text-secondary hover:text-text-primary";

    return (
      <button
        ref={ref}
        type="button"
        className={`inline-flex items-center justify-center w-6 h-6 rounded-sm transition-colors ${variantClass} ${className}`}
        {...props}
      />
    );
  }
);
IconButton.displayName = "IconButton";