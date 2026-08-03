import { useState, useMemo } from "react";
import { Product, FilterState, ExpiryStatus } from "@/types";
import { getProductValidade } from "@/utils/dateUtils";

const DEFAULT_FILTERS: FilterState = {
  search:  "",
  status:  "all",
  sortBy:  "dataValidade",
  sortDir: "asc",
};

export function useFilters(products: Product[]) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const filtered = useMemo(() => {
    let result = [...products];

    // ── Busca por código de barras, descrição ou observações ─────────────────
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.descricao.toLowerCase().includes(q) ||
          (p.codigoBarras ?? "").toLowerCase().includes(q) ||
          (p.observacoes  ?? "").toLowerCase().includes(q)
      );
    }

    // ── Filtro por status de validade ─────────────────────────────────────────
    if (filters.status !== "all") {
      result = result.filter(
        (p) => getProductValidade(p).status === filters.status
      );
    }

    // ── Ordenação ─────────────────────────────────────────────────────────────
    result.sort((a, b) => {
      let cmp = 0;
      switch (filters.sortBy) {
        case "dataValidade":
          cmp = (a.dataValidade ?? "").localeCompare(b.dataValidade ?? "");
          break;
        case "descricao":
          cmp = (a.descricao ?? "").localeCompare(b.descricao ?? "", "pt-BR");
          break;
        case "quantidade":
          cmp = (a.quantidade ?? 0) - (b.quantidade ?? 0);
          break;
        case "updatedAt":
          cmp = (a.updatedAt ?? "").localeCompare(b.updatedAt ?? "");
          break;
      }
      return filters.sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [products, filters]);

  const setFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSort = (column: FilterState["sortBy"]) => {
    setFilters((prev) => ({
      ...prev,
      sortBy:  column,
      sortDir: prev.sortBy === column && prev.sortDir === "asc" ? "desc" : "asc",
    }));
  };

  const setStatus = (status: ExpiryStatus | "all") =>
    setFilters((prev) => ({ ...prev, status }));

  const reset = () => setFilters(DEFAULT_FILTERS);

  const isActive =
    filters.search !== "" ||
    filters.status !== "all" ||
    filters.sortBy !== DEFAULT_FILTERS.sortBy ||
    filters.sortDir !== DEFAULT_FILTERS.sortDir;

  return { filters, filtered, setFilter, setStatus, toggleSort, reset, isActive };
}
