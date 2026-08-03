import { useState, useMemo } from "react";
import { Download, FileSpreadsheet, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { getProductValidade } from "@/utils/dateUtils";
import { exportToExcel } from "@/utils/exportUtils";
import { ExpiryStatus } from "@/types";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";

const ALL_STATUSES: { value: ExpiryStatus | "all"; label: string }[] = [
  { value: "all",      label: "Todos os status" },
  { value: "vencido",  label: "Vencidos" },
  { value: "proximo",  label: "Próximos do vencimento" },
  { value: "ok",       label: "Dentro da validade" },
];

export default function ReportsPage() {
  const { products, loading } = useProducts();
  const [status,   setStatus]   = useState<ExpiryStatus | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [exporting, setExporting] = useState(false);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (status !== "all" && getProductValidade(p).status !== status) return false;
        if (dateFrom && p.dataValidade < dateFrom) return false;
        if (dateTo   && p.dataValidade > dateTo)   return false;
        return true;
      }),
    [products, status, dateFrom, dateTo]
  );

  const breakdown = useMemo(() => {
    const c = { vencido: 0, proximo: 0, ok: 0 };
    for (const p of filtered) c[getProductValidade(p).status]++;
    return c;
  }, [filtered]);

  const handleExport = async () => {
    if (filtered.length === 0) return;
    setExporting(true);
    try {
      await exportToExcel(filtered, "controle-validade");
    } finally {
      setExporting(false);
    }
  };

  const hasFilters = status !== "all" || dateFrom !== "" || dateTo !== "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Relatórios</h1>
          <p className="text-sm text-[var(--color-text-soft)] mt-0.5">Exporte os dados de validade</p>
        </div>
        {products.length > 0 && (
          <Button
            icon={<Download size={15} />}
            onClick={handleExport}
            loading={exporting}
            disabled={filtered.length === 0}
          >
            Exportar Excel
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-[var(--color-text-soft)]">Carregando...</p>
      ) : products.length === 0 ? (
        <div
          className="bg-white rounded-xl flex flex-col items-center justify-center py-16 text-center"
          style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--color-border)" }}
        >
          <p className="text-base font-semibold text-[var(--color-text)] mb-2">Nenhum produto cadastrado</p>
          <p className="text-sm text-[var(--color-text-soft)] mb-5 max-w-xs">Cadastre produtos para gerar relatórios.</p>
          <Link to="/products"><Button icon={<PlusCircle size={15} />}>Cadastrar primeiro produto</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Painel de filtros */}
          <div
            className="bg-white rounded-xl p-5"
            style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--color-border)" }}
          >
            <h2 className="text-sm font-semibold text-[var(--color-text)] mb-4">Filtros de exportação</h2>
            <div className="flex flex-col gap-4">
              <Select
                label="Status de Validade"
                value={status}
                onChange={(e) => setStatus(e.target.value as ExpiryStatus | "all")}
                options={ALL_STATUSES}
              />
              <Input
                label="Validade a partir de"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <Input
                label="Validade até"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
              {hasFilters && (
                <button
                  onClick={() => { setStatus("all"); setDateFrom(""); setDateTo(""); }}
                  className="text-xs text-left cursor-pointer hover:underline"
                  style={{ color: "var(--color-blue)" }}
                >
                  Limpar filtros
                </button>
              )}
            </div>
          </div>

          {/* Prévia */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div
              className="bg-white rounded-xl p-5"
              style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--color-border)" }}
            >
              <h2 className="text-sm font-semibold text-[var(--color-text)] mb-4">Prévia do relatório</h2>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {(["vencido", "proximo", "ok"] as ExpiryStatus[]).map((s) => (
                  <div
                    key={s}
                    className="flex flex-col items-center justify-center rounded-xl p-3 gap-2"
                    style={{ backgroundColor: "var(--color-gray-light)", border: "1px solid var(--color-border)" }}
                  >
                    <span
                      className="text-2xl font-bold"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color:
                          s === "vencido"  ? "var(--color-red)" :
                          s === "proximo"  ? "#a16207"           :
                          "var(--color-green)",
                      }}
                    >
                      {breakdown[s]}
                    </span>
                    <Badge status={s} size="sm" />
                  </div>
                ))}
              </div>

              <div
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ backgroundColor: "var(--color-blue-light)", border: "1px solid #bfdbfe" }}
              >
                <FileSpreadsheet size={20} style={{ color: "var(--color-blue)" }} className="shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--color-text)]">
                    {filtered.length} {filtered.length === 1 ? "produto selecionado" : "produtos selecionados"}
                  </p>
                  <p className="text-xs text-[var(--color-text-soft)]">Abas: Produtos e Resumo</p>
                </div>
                <Button
                  icon={<Download size={14} />}
                  size="sm"
                  onClick={handleExport}
                  loading={exporting}
                  disabled={filtered.length === 0}
                >
                  Exportar
                </Button>
              </div>
            </div>

            {/* Amostra */}
            <div
              className="bg-white rounded-xl overflow-hidden"
              style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--color-border)" }}
            >
              <div
                className="px-5 py-3"
                style={{ backgroundColor: "var(--color-gray-light)", borderBottom: "1px solid var(--color-border)" }}
              >
                <p className="text-xs font-semibold text-[var(--color-text-soft)] uppercase tracking-wide">
                  Amostra — primeiros 5 resultados
                </p>
              </div>
              {filtered.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-[var(--color-text-soft)]">
                  Nenhum produto corresponde aos filtros selecionados.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--color-text-soft)]">Descrição</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--color-text-soft)] hidden sm:table-cell">Cód. Barras</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--color-text-soft)]">Validade</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--color-text-soft)]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 5).map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-[var(--color-gray-light)] transition-colors"
                        style={{ borderBottom: "1px solid var(--color-border)" }}
                      >
                        <td className="px-4 py-2.5 text-sm text-[var(--color-text)]">{p.descricao}</td>
                        <td className="px-4 py-2.5 hidden sm:table-cell text-xs text-[var(--color-text-soft)]" style={{ fontFamily: "var(--font-mono)" }}>
                          {p.codigoBarras ?? "—"}
                        </td>
                        <td className="px-4 py-2.5">
                          <span style={{ fontFamily: "var(--font-mono)" }} className="text-xs">{p.dataValidade}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge status={getProductValidade(p).status} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {filtered.length > 5 && (
                <div
                  className="px-4 py-2.5 text-xs text-[var(--color-text-soft)]"
                  style={{ borderTop: "1px solid var(--color-border)", backgroundColor: "var(--color-gray-light)" }}
                >
                  +{filtered.length - 5} produto(s) adicionais no arquivo exportado
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
