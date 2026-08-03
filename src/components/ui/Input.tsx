import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text)]">
            {label}
            {props.required && <span className="text-[var(--color-red)] ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-soft)]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-9 rounded-lg border bg-white text-sm text-[var(--color-text)]
              placeholder:text-[var(--color-text-soft)]
              focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/30 focus:border-[var(--color-blue)]
              disabled:bg-[var(--color-gray-light)] disabled:cursor-not-allowed
              transition-colors
              ${error ? "border-[var(--color-red)]" : "border-[var(--color-border)]"}
              ${leftIcon ? "pl-9" : "pl-3"}
              ${rightIcon ? "pr-9" : "pr-3"}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-soft)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-[var(--color-red)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--color-text-soft)]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
