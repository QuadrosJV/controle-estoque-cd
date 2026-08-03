import { useState, useMemo } from "react";
import { XCircle, Clock, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { getProductValidade, formatDate } from "@/utils/dateUtils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

type Tab = "vencido" | "proximo";

export default function AlertsPage() {
  const { products, loading } = useProducts();
  const [activeTab, setActiveTab] = useState<Tab>("vencido");

  const grouped = useMemo(() => {
    const map: Record<Tab, typeof products> = { vencido: [], proximo: [] };
    for (const p of products) {
      const s = getProductValidade(p).status;
      if (s === "vencido" || s === "proximo") map[s].push(p);
    }
    map.vencido.sort((a, b) => a.dataValidade.localeCompare(b.dataValidade));
    map.proximo.sort((a, b) => a.dataValidade.localeCompare(b.dataValidade));
    return map;
  }, [products]);

  const currentList = grouped[activeTab];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Alertas de Validade</h1>
        <p className="text-sm text-[var(--color-text-soft)] mt-0.5">
          Produtos vencidos e próximos do vencimento
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ backgroundColor: "var(--color-gray-light)", border: "1px solid var(--color-border)" }}
      >
        {(["vencido", "proximo"] as Tab[]).map((tab) => {
          const isActive = activeTab === tab;
          const color    = tab === "vencido" ? "var(--color-red)" : "#a16207";
          const lightBg  = tab === "vencido" ? "var(--color-red-light)" : "var(--color-yellow-light)";
          const Icon     = tab === "vencido" ? XCircle : Clock;
          const label    = tab === "vencido" ? "Vencidos" : "Próximos do Vencimento";

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-white text-[var(--color-text)]"
                  : "text-[var(--color-text-soft)] hover:text-[var(--color-text)]"
              }`}
              style={isActive ? { boxShadow: "var(--shadow-sm)" } : {}}
            >
              <Icon size={14} style={{ color: isActive ? color : "var(--color-text-soft)" }} />
              {label}
              <span
                className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold"
                style={{ fontFamily: "var(--font-mono)", backgroundColor: lightBg, color }}
              >
                {grouped[tab].length}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40 text-[var(--color-text-soft)] text-sm">Carregando...</div>
      ) : products.length === 0 ? (
        <div
          className="bg-white rounded-xl flex flex-col items-center justify-center py-16 text-center"
          style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--color-border)" }}
        >
          <p className="text-base font-semibold text-[var(--color-text)] mb-2">Nenhum produto cadastrado</p>
          <p className="text-sm text-[var(--color-text-soft)] mb-5 max-w-xs">
            Cadastre produtos para monitorar as datas de validade.
          </p>
          <Link to="/products">
            <Button icon={<PlusCircle size={15} />}>Cadastrar primeiro produto</Button>
          </Link>
        </div>
      ) : currentList.length === 0 ? (
        <div
          className="bg-white rounded-xl flex flex-col items-center justify-center py-14 text-center"
          style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--color-border)" }}
        >
          <p className="text-sm font-semibold text-[var(--color-text)] mb-1">
            {activeTab === "vencido" ? "Nenhum produto vencido" : "Nenhum produto próximo do vencimento"}
          </p>
        </div>
      ) : (
        <div
          className="bg-white rounded-xl overflow-hidden"
          style={{ boxShadow: "var(--shadow-card)", border: "1px solid var(--color-border)" }}
        >
          {/* Banner de alerta */}
          <div
            className="px-5 py-3 flex items-center gap-2"
            style={{
              backgroundColor: activeTab === "vencido" ? "var(--color-red-light)" : "var(--color-yellow-light)",
              borderBottom: `1px solid ${activeTab === "vencido" ? "#fecaca" : "#fef08a"}`,
            }}
          >
            {activeTab === "vencido"
              ? <XCircle size={15} style={{ color: "var(--color-red)" }} />
              : <Clock size={15} style={{ color: "#a16207" }} />}
            <p
              className="text-xs font-semibold"
              style={{ color: activeTab === "vencido" ? "#b91c1c" : "#a16207" }}
            >
              {activeTab === "vencido"
                ? `${currentList.length} produto${currentList.length !== 1 ? "s" : ""} vencido${currentList.length !== 1 ? "s" : ""} — retire do estoque imediatamente`
                : `${currentList.length} produto${currentList.length !== 1 ? "s" : ""} próximo${currentList.length !== 1 ? "s" : ""} do vencimento — priorize as vendas`}
            </p>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: "var(--color-gray-light)", borderBottom: "1px solid var(--color-border)" }}>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-soft)] uppercase tracking-wide">Descrição</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-soft)] uppercase tracking-wide hidden md:table-cell">Cód. Barras</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-soft)] uppercase tracking-wide hidden sm:table-cell">Qtd</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-soft)] uppercase tracking-wide">Validade</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-soft)] uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentList.map((product) => {
                const val   = getProductValidade(product);
                const rowBg = activeTab === "vencido" ? "#FEF2F2" : "#FEFCE8";
                return (
                  <tr
                    key={product.id}
                    className="transition-colors hover:brightness-[0.97]"
                    style={{ backgroundColor: rowBg, borderBottom: "1px solid var(--color-border)" }}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--color-text)]">{product.descricao}</p>
                      {product.observacoes && (
                        <p className="text-xs text-[var(--color-text-soft)] mt-0.5 truncate max-w-xs">{product.observacoes}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-[var(--color-text-soft)]" style={{ fontFamily: "var(--font-mono)" }}>
                        {product.codigoBarras ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span style={{ fontFamily: "var(--font-mono)" }} className="text-sm">
                        {product.quantidade}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p style={{ fontFamily: "var(--font-mono)" }} className="text-sm">{formatDate(product.dataValidade)}</p>
                      <p
                        className="text-xs font-bold mt-0.5"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: activeTab === "vencido" ? "var(--color-red)" : "#a16207",
                        }}
                      >
                        {val.textoStatus}
                      </p>
                    </td>
                    <td className="px-4 py-3"><Badge status={val.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div
            className="px-4 py-2.5 text-xs text-[var(--color-text-soft)]"
            style={{ borderTop: "1px solid var(--color-border)", backgroundColor: "var(--color-gray-light)" }}
          >
            {currentList.length} {currentList.length === 1 ? "produto" : "produtos"}
          </div>
        </div>
      )}
    </div>
  );
}
