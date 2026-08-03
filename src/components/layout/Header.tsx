import { ShieldCheck, Menu, CalendarDays } from "lucide-react";

interface HeaderProps {
  onMenuToggle?: () => void;
}

function today(): string {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "short",
    day:     "2-digit",
    month:   "short",
    year:    "numeric",
  });
}

export default function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header
      className="flex items-center gap-3 px-5 bg-white border-b border-[var(--color-border)] shrink-0 z-40"
      style={{ height: "var(--header-h)", boxShadow: "var(--shadow-sm)" }}
      role="banner"
    >
      {/* Mobile hamburger */}
      {onMenuToggle && (
        <button
          onClick={onMenuToggle}
          className="md:hidden p-1.5 rounded-lg hover:bg-[var(--color-gray-light)] text-[var(--color-text-soft)] transition-colors cursor-pointer"
          aria-label="Abrir menu de navegação"
        >
          <Menu size={18} />
        </button>
      )}

      {/* Logo + Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
          style={{ backgroundColor: "var(--color-blue)" }}
          aria-hidden="true"
        >
          <ShieldCheck size={15} className="text-white" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[var(--color-text)] text-sm leading-tight truncate">
            Controle de Validade de Produtos
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)] leading-none mt-0.5 hidden sm:block">
            Gestão de Estoque
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1.5" style={{ color: "var(--color-text-soft)" }}>
          <CalendarDays size={13} aria-hidden="true" />
          <span className="text-xs capitalize" style={{ fontFamily: "var(--font-mono)" }}>
            {today()}
          </span>
        </div>

        <div className="hidden md:block w-px h-4" style={{ backgroundColor: "var(--color-border)" }} aria-hidden="true" />

        <span
          className="text-[11px] px-2 py-0.5 rounded font-medium select-none"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-soft)",
            backgroundColor: "var(--color-gray-light)",
            border: "1px solid var(--color-border)",
          }}
        >
          v1.0
        </span>
      </div>
    </header>
  );
}
