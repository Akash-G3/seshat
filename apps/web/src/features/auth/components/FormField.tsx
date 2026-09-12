import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, Props>(
  ({ label, error, id, className = "", ...props }, ref) => {
    return (
      <div>
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text-secondary">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={`w-full rounded-md border bg-bg px-3 py-2 text-sm text-text-primary outline-none transition-colors duration-150 placeholder:text-text-muted ${
            error ? "border-danger" : "border-border focus:border-accent"
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      </div>
    );
  }
);
FormField.displayName = "FormField";