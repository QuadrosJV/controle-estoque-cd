import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--color-blue)] text-white hover:bg-[var(--color-blue-dark)] active:bg-[#1e40af]",
  secondary:
    "bg-white text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-gray-light)]",
  danger:
    "bg-[var(--color-red)] text-white hover:bg-red-600 active:bg-red-700",
  ghost:
    "text-[var(--color-text-soft)] hover:bg-[var(--color-gray-light)] hover:text-[var(--color-text)]",
  outline:
    "border border-[var(--color-blue)] text-[var(--color-blue)] hover:bg-[var(--color-blue-light)]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-10 px-5 text-sm gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue)] focus-visible:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
      style={{ boxShadow: "var(--shadow-sm)", ...props.style }}
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
