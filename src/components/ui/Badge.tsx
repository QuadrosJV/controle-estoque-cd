import { ExpiryStatus } from "@/types";

interface BadgeProps {
  status: ExpiryStatus;
  size?: "sm" | "md";
}

const BADGE_CONFIG: Record<
  ExpiryStatus,
  { dot: string; bg: string; text: string; border: string; label: string }
> = {
  vencido: {
    dot:    "#ef4444",
    bg:     "#fef2f2",
    text:   "#b91c1c",
    border: "#fecaca",
    label:  "Vencido",
  },
  proximo: {
    dot:    "#f59e0b",
    bg:     "#fffbeb",
    text:   "#92400e",
    border: "#fde68a",
    label:  "Próximo do vencimento",
  },
  ok: {
    dot:    "#22c55e",
    bg:     "#f0fdf4",
    text:   "#15803d",
    border: "#bbf7d0",
    label:  "Dentro da validade",
  },
};

export default function Badge({ status, size = "md" }: BadgeProps) {
  const c = BADGE_CONFIG[status];

  if (size === "sm") {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
        style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: c.dot }}
        />
        {c.label}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      <span
        className="inline-block w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: c.dot }}
      />
      {c.label}
    </span>
  );
}
