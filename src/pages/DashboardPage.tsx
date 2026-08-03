import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShieldCheck,
  Clock,
  XCircle,
  ArrowRight,
  PlusCircle,
  CheckCircle,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { getProductValidade, formatDate } from "@/utils/dateUtils";
import StatCard from "@/components/dashboard/StatCard";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

// ─── Descrições dinâmicas por card ───────────────────────────────────────────

function totalDescription(total: number): string {
  if (total === 0) return "Nenhum produto cadastrado ainda.";
  if (total === 1) return "1 produto monitorado no estoque.";
  return `${total} produtos monitorados no estoque.`;
}

function okDescription(ok: number, total: number): string {
  if (total === 0) return "Cadastre produtos para monitorar.";
  if (ok === 0) return "Nenhum produto dentro da validade.";
  const pct = Math.round((ok / total) * 100);
  return `${pct}% do estoque em condições ideais.`;
}

function nearDescription(near: number): string {
  if (near === 0) return "Nenhum produto próximo do vencimento.";
  if (near === 1) return "1 produto vence em até 90 dias — priorize as vendas.";
  return `${near} produtos vencem em até 90 dias — priorize as vendas.`;
}

function expiredDescription(expired: number): string {
  if (expired === 0) return "Nenhum produto vencido no estoque.";
  if (expired === 1) return "1 produto vencido — remova do estoque imediatamente.";
  return `${expired} produtos vencidos — remova do estoque imediatamente.`;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  // useProducts re-renders automaticamente sempre que addProduct / updateProduct
  // / removeProduct alteram o estado, mantendo os cartões sempre sincronizados.
  const { products, loading } = useProducts();

  const stats = useMemo(() => {
    const c = { total: products.length, vencido: 0, proximo: 0, ok: 0 };
    for (const p of products) c[getProductValidade(p).status]++;
    return c;
  }, [products]);

  const urgentProducts = useMemo(
    () =>
      [...products]
        .filter((p) => {
          const s = getProductValidade(p).status;
          return s === "vencido" || s === "proximo";
        })
        .sort((a, b) => (a.dataValidade ?? "").localeCompare(b.dataValidade ?? ""))
        .slice(0, 8),
    [products]
  );

  const CARDS = [
    {
      label: "Total de Produtos",
      value: stats.total,
      icon: <Package size={20} />,
      description: totalDescription(stats.total),
      accentColor: "var(--color-blue)",
      lightColor: "var(--color-blue-light)",
    },
    {
      label: "Dentro da Validade",
      value: stats.ok,
      icon: <ShieldCheck size={20} />,
      description: okDescription(stats.ok, stats.total),
      accentColor: "#16a34a",
      lightColor: "#f0fdf4",
    },
    {
      label: "Próximos do Vencimento",
      value: stats.proximo,
      icon: <Clock size={20} />,
      description: nearDescription(stats.proximo),
      accentColor: "#a16207",
      lightColor: "#fefce8",
    },
    {
      label: "Produtos Vencidos",
      value: stats.vencido,
      icon: <XCircle size={20} />,
      description: expiredDescription(stats.vencido),
      accentColor: "var(--color-red)",
      lightColor: "var(--color-red-light)",
    },
  ] as const;

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Dashboard</h1>
          <p className="text-sm text-[var(--color-text-soft)] mt-0.5">
            Visão geral do controle de validade
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl h-36 animate-pulse"
              style={{ border: "1px solid var(--color-border)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Dashboard</h1>
        <p className="text-sm text-[var(--color-text-soft)] mt-0.5">
          Visão geral do controle de validade
        </p>
      </div>

      {/* ── Quatro cartões de indicadores ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {CARDS.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* ── Estado vazio ── */}
      {products.length === 0 && (
        <div
          className="bg-white rounded-xl flex flex-col items-center justify-center py-16 text-center"
          style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--color-border)" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: "var(--color-blue-light)" }}
          >
            <Package size={24} style={{ color: "var(--color-blue)" }} />
          </div>
          <p className="text-base font-semibold text-[var(--color-text)] mb-2">
            Nenhum produto cadastrado
          </p>
          <p className="text-sm text-[var(--color-text-soft)] mb-6 max-w-xs">
            Cadastre os produtos do estoque para visualizar os indicadores de validade.
          </p>
          <Link to="/products">
            <Button icon={<PlusCircle size={15} />}>Cadastrar primeiro produto</Button>
          </Link>
        </div>
      )}

      {/* ── Seção de detalhes (apenas quando há produtos) ── */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Lista de atenção */}
          <div
            className="lg:col-span-2 bg-white rounded-xl overflow-hidden"
            style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--color-border)" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">
                Produtos que precisam de atenção
              </h2>
              <Link
                to="/alerts"
                className="text-xs font-medium flex items-center gap-1 hover:underline"
                style={{ color: "var(--color-blue)" }}
              >
                Ver todos <ArrowRight size={12} />
              </Link>
            </div>

            {urgentProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: "#f0fdf4" }}
                >
                  <CheckCircle size={20} style={{ color: "#16a34a" }} />
                </div>
                <p className="text-sm font-medium text-[var(--color-text)]">
                  Estoque totalmente dentro da validade
                </p>
                <p className="text-xs text-[var(--color-text-soft)] mt-1">
                  Nenhum produto vencido ou próximo do vencimento.
                </p>
              </div>
            ) : (
              urgentProducts.map((p) => {
                const val = getProductValidade(p);
                const rowBg = val.corStatus === "vermelho" ? "#FEF2F2" : "#FEFCE8";
                const textColor = val.corStatus === "vermelho" ? "var(--color-red)" : "#a16207";
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-5 py-3.5 transition-colors"
                    style={{
                      borderBottom: "1px solid var(--color-border)",
                      backgroundColor: rowBg,
                    }}
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-medium text-[var(--color-text)] truncate">
                        {p.descricao}
                      </p>
                      {p.codigoBarras && (
                        <p
                          className="text-xs text-[var(--color-text-soft)] mt-0.5"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {p.codigoBarras}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p
                          className="text-xs text-[var(--color-text-soft)]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {formatDate(p.dataValidade)}
                        </p>
                        <p
                          className="text-xs font-bold mt-0.5"
                          style={{ fontFamily: "var(--font-mono)", color: textColor }}
                        >
                          {val.textoStatus}
                        </p>
                      </div>
                      <Badge status={val.status} size="sm" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Distribuição por status */}
          <div
            className="bg-white rounded-xl"
            style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--color-border)" }}
          >
            <div className="px-5 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-sm font-semibold text-[var(--color-text)]">
                Distribuição por status
              </h2>
            </div>
            <div className="px-5 py-5 flex flex-col gap-5">
              {(
                [
                  {
                    key: "ok" as const,
                    label: "Dentro da validade",
                    color: "#16a34a",
                    bg: "#f0fdf4",
                    borderColor: "#16a34a",
                  },
                  {
                    key: "proximo" as const,
                    label: "Próx. do vencimento",
                    color: "#a16207",
                    bg: "#fefce8",
                    borderColor: "#a16207",
                  },
                  {
                    key: "vencido" as const,
                    label: "Vencidos",
                    color: "var(--color-red)",
                    bg: "var(--color-red-light)",
                    borderColor: "var(--color-red)",
                  },
                ]
              ).map(({ key, label, color, bg }) => {
                const count = stats[key];
                const pct   = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[var(--color-text)]">{label}</span>
                      <span
                        className="text-xs font-semibold"
                        style={{ fontFamily: "var(--font-mono)", color }}
                      >
                        {count}{" "}
                        <span className="text-[var(--color-text-soft)] font-normal">
                          ({pct}%)
                        </span>
                      </span>
                    </div>
                    <div
                      className="h-2.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: "var(--color-gray-light)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: pct > 0 ? `${pct}%` : "0%",
                          backgroundColor: color,
                          minWidth: count > 0 ? "4px" : "0px",
                        }}
                      />
                    </div>

                    {/* Pill contagem */}
                    {count > 0 && (
                      <div className="flex mt-1.5">
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: bg, color }}
                        >
                          {count === 1 ? "1 produto" : `${count} produtos`}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Total */}
              <div
                className="pt-4 mt-1"
                style={{ borderTop: "1px solid var(--color-border)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-text-soft)]">Total no estoque</span>
                  <span
                    className="text-sm font-bold text-[var(--color-text)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {stats.total}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
