import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-semibold uppercase tracking-widest text-charcoal"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn("input-underline font-body text-base", className)}
        ref={ref}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

export { Input };
