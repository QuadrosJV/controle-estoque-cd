import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = "", id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-[var(--color-text)]">
            {label}
            {props.required && <span className="text-[var(--color-red)] ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full h-9 pl-3 pr-8 rounded-lg border bg-white text-sm text-[var(--color-text)] appearance-none
              focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/30 focus:border-[var(--color-blue)]
              disabled:bg-[var(--color-gray-light)] disabled:cursor-not-allowed
              transition-colors cursor-pointer
              ${error ? "border-[var(--color-red)]" : "border-[var(--color-border)]"}
              ${className}
            `}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-soft)] pointer-events-none"
          />
        </div>
        {error && <p className="text-xs text-[var(--color-red)]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
