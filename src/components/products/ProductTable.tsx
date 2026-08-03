import { ChevronUp, ChevronDown, ChevronsUpDown, Pencil, Trash2, PlusCircle, Barcode, ScanBarcode } from "lucide-react";
import { Product, FilterState } from "@/types";
import { formatDate, getProductValidade } from "@/utils/dateUtils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface ProductTableProps {
  products:   Product[];
  totalCount: number;
  sortBy:     FilterState["sortBy"];
  sortDir:    FilterState["sortDir"];
  onSort:     (col: FilterState["sortBy"]) => void;
  onEdit:     (product: Product) => void;
  onDelete:   (product: Product) => void;
  onAddFirst: () => void;
}

// ─── Indicador de ordenação ───────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) return <ChevronsUpDown size={11} className="opacity-25 ml-0.5" />;
  return dir === "asc"
    ? <ChevronUp   size={11} className="ml-0.5" style={{ color: "var(--color-blue)" }} />
    : <ChevronDown size={11} className="ml-0.5" style={{ color: "var(--color-blue)" }} />;
}

// ─── Estado vazio — sem produtos ─────────────────────────────────────────────

function EmptyDatabase({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ backgroundColor: "var(--color-blue-light)" }}
      >
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <rect x="3" y="8" width="24" height="15" rx="2.5"
            stroke="var(--color-blue)" strokeWidth="1.6" fill="none" />
          <path d="M3 12.5h24" stroke="var(--color-blue)" strokeWidth="1.6" />
          <path d="M8.5 17h5M8.5 20.5h9"
            stroke="var(--color-blue)" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-[15px] font-semibold text-[var(--color-text)] mb-1.5">
        Nenhum produto cadastrado
      </p>
      <p className="text-sm text-[var(--color-text-soft)] mb-7 max-w-xs leading-relaxed">
        Cadastre os produtos do estoque para começar a monitorar as datas de validade.
      </p>
      <Button icon={<PlusCircle size={15} />} onClick={onAdd}>
        Cadastrar primeiro produto
      </Button>
    </div>
  );
}

// ─── Estado vazio — filtro sem resultados ─────────────────────────────────────

function EmptyFiltered() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: "var(--color-gray-light)" }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="9" cy="9" r="6" stroke="var(--color-text-soft)" strokeWidth="1.5" />
          <path d="M14 14l3 3" stroke="var(--color-text-soft)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M7 9h4M9 7v4" stroke="var(--color-text-soft)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-[var(--color-text)] mb-1">
        Nenhum produto encontrado
      </p>
      <p className="text-xs text-[var(--color-text-soft)]">
        Tente ajustar os filtros ou o termo de busca.
      </p>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ProductTable({
  products,
  totalCount,
  sortBy,
  sortDir,
  onSort,
  onEdit,
  onDelete,
  onAddFirst,
}: ProductTableProps) {
  const card = {
    boxShadow: "0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.04)",
    border: "1px solid var(--color-border)",
  };

  if (totalCount === 0) {
    return (
      <div className="bg-white rounded-2xl overflow-hidden" style={card}>
        <EmptyDatabase onAdd={onAddFirst} />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl overflow-hidden" style={card}>
        <EmptyFiltered />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden" style={card}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">

          {/* ── Cabeçalho ─────────────────────────────────────────────────── */}
          <thead>
            <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid var(--color-border)" }}>

              {/* Código de Barras */}
              <th className="px-5 py-3.5 text-left hidden lg:table-cell">
                <span className="text-[11px] font-semibold text-[var(--color-text-soft)] uppercase tracking-wider">
                  Código de Barras
                </span>
              </th>

              {/* Produto — sortável */}
              <th className="px-5 py-3.5 text-left">
                <button
                  onClick={() => onSort("descricao")}
                  className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[var(--color-text-soft)] uppercase tracking-wider hover:text-[var(--color-text)] transition-colors cursor-pointer"
                >
                  Produto
                  <SortIcon active={sortBy === "descricao"} dir={sortDir} />
                </button>
              </th>

              {/* Quantidade — sortável */}
              <th className="px-5 py-3.5 text-right hidden sm:table-cell">
                <button
                  onClick={() => onSort("quantidade")}
                  className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[var(--color-text-soft)] uppercase tracking-wider hover:text-[var(--color-text)] transition-colors cursor-pointer ml-auto"
                >
                  Qtd
                  <SortIcon active={sortBy === "quantidade"} dir={sortDir} />
                </button>
              </th>

              {/* Data de Validade — sortável */}
              <th className="px-5 py-3.5 text-left">
                <button
                  onClick={() => onSort("dataValidade")}
                  className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[var(--color-text-soft)] uppercase tracking-wider hover:text-[var(--color-text)] transition-colors cursor-pointer"
                >
                  Data de Validade
                  <SortIcon active={sortBy === "dataValidade"} dir={sortDir} />
                </button>
              </th>

              {/* Dias Restantes */}
              <th className="px-5 py-3.5 text-left hidden md:table-cell">
                <span className="text-[11px] font-semibold text-[var(--color-text-soft)] uppercase tracking-wider">
                  Dias Restantes
                </span>
              </th>

              {/* Status */}
              <th className="px-5 py-3.5 text-left">
                <span className="text-[11px] font-semibold text-[var(--color-text-soft)] uppercase tracking-wider">
                  Status
                </span>
              </th>

              {/* Ações */}
              <th className="px-5 py-3.5 text-right">
                <span className="text-[11px] font-semibold text-[var(--color-text-soft)] uppercase tracking-wider">
                  Ações
                </span>
              </th>
            </tr>
          </thead>

          {/* ── Corpo ─────────────────────────────────────────────────────── */}
          <tbody>
            {products.map((product, i) => {
              const val = getProductValidade(product);

              // Cor da linha esquerda (accent border) por status
              const accentColor =
                val.corStatus === "vermelho" ? "#ef4444" :
                val.corStatus === "amarelo"  ? "#f59e0b" :
                "transparent";

              // Fundo sutil por status; linhas "ok" alternam
              const rowBg =
                val.corStatus === "vermelho" ? "#fff8f8" :
                val.corStatus === "amarelo"  ? "#fffdf0" :
                i % 2 === 1                  ? "#FAFBFC" : "#FFFFFF";

              // Cor do texto de dias restantes
              const diasColor =
                val.corStatus === "vermelho" ? "#dc2626" :
                val.corStatus === "amarelo"  ? "#b45309" :
                "#64748b";

              return (
                <tr
                  key={product.id}
                  className="group transition-colors duration-100"
                  style={{
                    backgroundColor: rowBg,
                    borderBottom: "1px solid #F1F5F9",
                    borderLeft: `3px solid ${accentColor}`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                      val.corStatus === "vermelho" ? "#fff1f1" :
                      val.corStatus === "amarelo"  ? "#fff8e0" :
                      "#F0F4F8";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor = rowBg;
                  }}
                >
                  {/* ── Código de Barras ─────────────────────────────────── */}
                  <td className="px-5 py-4 hidden lg:table-cell">
                    {product.codigoBarras ? (
                      <div className="flex items-center gap-2">
                        <Barcode
                          size={13}
                          className="shrink-0"
                          style={{ color: "var(--color-text-soft)" }}
                        />
                        <span
                          className="text-xs text-[var(--color-text-soft)] tracking-wide"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {product.codigoBarras}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ScanBarcode size={13} className="opacity-20 shrink-0" />
                        <span className="text-xs text-[var(--color-text-soft)] opacity-30">
                          —
                        </span>
                      </div>
                    )}
                  </td>

                  {/* ── Produto ──────────────────────────────────────────── */}
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-[var(--color-text)] leading-snug">
                      {product.descricao}
                    </p>
                    {product.observacoes && (
                      <p className="text-xs text-[var(--color-text-soft)] mt-0.5 max-w-[220px] truncate leading-relaxed">
                        {product.observacoes}
                      </p>
                    )}
                  </td>

                  {/* ── Quantidade ───────────────────────────────────────── */}
                  <td className="px-5 py-4 hidden sm:table-cell text-right">
                    <span
                      className="text-sm font-semibold text-[var(--color-text)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {product.quantidade.toLocaleString("pt-BR")}
                    </span>
                  </td>

                  {/* ── Data de Validade ─────────────────────────────────── */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span
                      className="text-sm text-[var(--color-text)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {formatDate(product.dataValidade)}
                    </span>
                  </td>

                  {/* ── Dias Restantes ───────────────────────────────────── */}
                  <td className="px-5 py-4 hidden md:table-cell whitespace-nowrap">
                    <span
                      className="text-[13px] font-semibold"
                      style={{ fontFamily: "var(--font-mono)", color: diasColor }}
                    >
                      {val.textoStatus}
                    </span>
                  </td>

                  {/* ── Status ───────────────────────────────────────────── */}
                  <td className="px-5 py-4">
                    <Badge status={val.status} />
                  </td>

                  {/* ── Ações ────────────────────────────────────────────── */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <ActionButton
                        label="Editar produto"
                        onClick={() => onEdit(product)}
                        color="#2563EB"
                        hoverBg="#EFF6FF"
                      >
                        <Pencil size={14} />
                      </ActionButton>
                      <ActionButton
                        label="Excluir produto"
                        onClick={() => onDelete(product)}
                        color="#dc2626"
                        hoverBg="#FEF2F2"
                      >
                        <Trash2 size={14} />
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Rodapé ────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          borderTop: "1px solid var(--color-border)",
          backgroundColor: "#F8FAFC",
        }}
      >
        <span className="text-xs text-[var(--color-text-soft)]">
          {products.length === totalCount ? (
            <>
              <span className="font-semibold text-[var(--color-text)]">{totalCount}</span>
              {" "}
              {totalCount === 1 ? "produto" : "produtos"}
            </>
          ) : (
            <>
              <span className="font-semibold text-[var(--color-text)]">{products.length}</span>
              {" de "}
              <span className="font-semibold text-[var(--color-text)]">{totalCount}</span>
              {" produtos"}
            </>
          )}
        </span>

        {products.length !== totalCount && (
          <span className="text-[11px] text-[var(--color-text-soft)] bg-[var(--color-border)] px-2 py-0.5 rounded-full">
            filtro ativo
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Botão de ação com hover colorido ────────────────────────────────────────

function ActionButton({
  children,
  label,
  onClick,
  color,
  hoverBg,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
  hoverBg: string;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className="
        w-8 h-8 rounded-lg flex items-center justify-center
        transition-all duration-150 cursor-pointer
      "
      style={{ color: "#94a3b8" }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.backgroundColor = hoverBg;
        el.style.color = color;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.backgroundColor = "transparent";
        el.style.color = "#94a3b8";
      }}
    >
      {children}
    </button>
  );
}
