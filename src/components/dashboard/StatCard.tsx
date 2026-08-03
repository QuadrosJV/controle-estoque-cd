import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  description: string;
  accentColor: string;
  lightColor: string;
  /** Optional left-border accent (defaults to accentColor) */
  borderColor?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  description,
  accentColor,
  lightColor,
  borderColor,
}: StatCardProps) {
  return (
    <div
      className="bg-white rounded-xl overflow-hidden flex flex-col"
      style={{
        boxShadow: "var(--shadow-card)",
        border: "1px solid var(--color-border)",
        borderLeft: `4px solid ${borderColor ?? accentColor}`,
      }}
    >
      <div className="flex items-start justify-between p-5 pb-4">
        {/* Icon badge */}
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
          style={{ backgroundColor: lightColor, color: accentColor }}
        >
          {icon}
        </div>

        {/* Value */}
        <p
          className="text-4xl font-bold leading-none tabular-nums mt-0.5"
          style={{ color: accentColor, fontFamily: "var(--font-mono)" }}
        >
          {value}
        </p>
      </div>

      <div
        className="px-5 pb-4 pt-0 flex-1 flex flex-col justify-end"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <p
          className="text-[11px] font-bold uppercase tracking-widest mt-3 mb-1"
          style={{ color: accentColor }}
        >
          {label}
        </p>
        <p className="text-xs text-[var(--color-text-soft)] leading-snug">{description}</p>
      </div>
    </div>
  );
}
