import { useRef } from "react";
import {
  Search, X, ArrowUpDown, ArrowUp, ArrowDown,
  ShieldCheck, Clock, XCircle, LayoutList,
} from "lucide-react";
import { FilterState, ExpiryStatus } from "@/types";

interface ProductFiltersProps {
  filters:   FilterState;
  counts?:   { all: number; vencido: number; proximo: number; ok: number };
  onFilter:  <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onStatus:  (s: ExpiryStatus | "all") => void;
  onSort:    (col: FilterState["sortBy"]) => void;
  onReset:   () => void;
  isActive:  boolean;
}

// ─── Chips de filtro rápido ───────────────────────────────────────────────────

const STATUS_CHIPS: {
  value: ExpiryStatus | "all";
  label: string;
  icon:  React.ReactNode;
  activeStyle: { bg: string; text: string; border: string };
}[] = [
  {
    value: "all",
    label: "Todos",
    icon:  <LayoutList size={13} />,
    activeStyle: { bg: "#EFF6FF", text: "#1d4ed8", border: "#bfdbfe" },
  },
  {
    value: "vencido",
    label: "Vencidos",
    icon:  <XCircle size={13} />,
    activeStyle: { bg: "#FEF2F2", text: "#b91c1c", border: "#fecaca" },
  },
  {
    value: "proximo",
    label: "Próximos",
    icon:  <Clock size={13} />,
    activeStyle: { bg: "#FFFBEB", text: "#92400e", border: "#fde68a" },
  },
  {
    value: "ok",
    label: "Na validade",
    icon:  <ShieldCheck size={13} />,
    activeStyle: { bg: "#F0FDF4", text: "#15803d", border: "#bbf7d0" },
  },
];

// ─── Botões de ordenação ──────────────────────────────────────────────────────

const SORT_OPTIONS: { col: FilterState["sortBy"]; label: string }[] = [
  { col: "descricao",    label: "Nome"            },
  { col: "quantidade",   label: "Quantidade"      },
  { col: "dataValidade", label: "Data de Validade"},
];

// ─── Componente ───────────────────────────────────────────────────────────────

const ZERO_COUNTS = { all: 0, vencido: 0, proximo: 0, ok: 0 };

export default function ProductFilters({
  filters,
  counts = ZERO_COUNTS,
  onFilter,
  onStatus,
  onSort,
  onReset,
  isActive,
}: ProductFiltersProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-4">

      {/* ── Linha 1: Busca ───────────────────────────────────────────────── */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--color-text-soft)" }}
        />
        <input
          ref={inputRef}
          type="text"
          value={filters.search}
          onChange={(e) => onFilter("search", e.target.value)}
          placeholder="Buscar por código de barras, descrição ou nome do produto..."
          className="
            w-full h-10 pl-10 pr-10 rounded-xl text-sm
            text-[var(--color-text)] placeholder:text-[var(--color-text-soft)]
            transition-all duration-150 outline-none
          "
          style={{
            border: filters.search
              ? "1.5px solid var(--color-blue)"
              : "1.5px solid var(--color-border)",
            backgroundColor: "#fff",
            boxShadow: filters.search
              ? "0 0 0 3px rgba(37,99,235,.08)"
              : "none",
          }}
        />
        {filters.search && (
          <button
            onClick={() => { onFilter("search", ""); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:bg-gray-100"
            style={{ color: "var(--color-text-soft)" }}
            aria-label="Limpar busca"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* ── Linha 2: Chips de status + Ordenação + Reset ─────────────────── */}
      <div className="flex flex-wrap items-center gap-2">

        {/* Filtros rápidos de status */}
        <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
          {STATUS_CHIPS.map(({ value, label, icon, activeStyle }) => {
            const isSelected = filters.status === value;
            const count      = counts[value];
            return (
              <button
                key={value}
                onClick={() => onStatus(value)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-100 cursor-pointer whitespace-nowrap"
                style={
                  isSelected
                    ? {
                        backgroundColor: activeStyle.bg,
                        color:           activeStyle.text,
                        border:          `1.5px solid ${activeStyle.border}`,
                      }
                    : {
                        backgroundColor: "#F8FAFC",
                        color:           "var(--color-text-soft)",
                        border:          "1.5px solid var(--color-border)",
                      }
                }
              >
                <span style={{ color: isSelected ? activeStyle.text : "var(--color-text-soft)" }}>
                  {icon}
                </span>
                {label}
                <span
                  className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold"
                  style={{
                    backgroundColor: isSelected ? activeStyle.border : "#e2e8f0",
                    color:           isSelected ? activeStyle.text   : "#64748b",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Separador visual */}
        <div
          className="hidden sm:block w-px h-6 shrink-0"
          style={{ backgroundColor: "var(--color-border)" }}
        />

        {/* Botões de ordenação */}
        <div className="flex items-center gap-1 shrink-0">
          <span
            className="text-[11px] font-semibold uppercase tracking-wider mr-1 hidden sm:block"
            style={{ color: "var(--color-text-soft)" }}
          >
            Ordenar
          </span>
          {SORT_OPTIONS.map(({ col, label }) => {
            const isActive = filters.sortBy === col;
            const Icon = isActive
              ? filters.sortDir === "asc" ? ArrowUp : ArrowDown
              : ArrowUpDown;

            return (
              <button
                key={col}
                onClick={() => onSort(col)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-100 cursor-pointer whitespace-nowrap"
                style={
                  isActive
                    ? {
                        backgroundColor: "#EFF6FF",
                        color:           "#1d4ed8",
                        border:          "1.5px solid #bfdbfe",
                      }
                    : {
                        backgroundColor: "#F8FAFC",
                        color:           "var(--color-text-soft)",
                        border:          "1.5px solid var(--color-border)",
                      }
                }
              >
                <Icon size={11} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Limpar tudo */}
        {isActive && (
          <>
            <div
              className="w-px h-6 shrink-0"
              style={{ backgroundColor: "var(--color-border)" }}
            />
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-100 cursor-pointer whitespace-nowrap"
              style={{
                backgroundColor: "#FFF7ED",
                color:           "#c2410c",
                border:          "1.5px solid #fed7aa",
              }}
            >
              <X size={11} />
              Limpar filtros
            </button>
          </>
        )}
      </div>
    </div>
  );
}
