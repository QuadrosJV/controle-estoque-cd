import { useState, useMemo } from "react";
import { Plus, Package, XCircle, Clock, CheckCircle, RefreshCw, FileDown } from "lucide-react";
import { Product, ProductFormData } from "@/types";
import { useProducts } from "@/hooks/useProducts";
import { useFilters } from "@/hooks/useFilters";
import { getProductValidade } from "@/utils/dateUtils";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import DuplicateDialog from "@/components/ui/DuplicateDialog";
import ProductTable from "@/components/products/ProductTable";
import ProductFilters from "@/components/products/ProductFilters";
import ProductForm from "@/components/products/ProductForm";
import StatCard from "@/components/dashboard/StatCard";
import { exportFilteredToExcel } from "@/utils/exportUtils";

export default function ProductsPage() {
  const { products, loading, addProduct, updateProduct, removeProduct, findDuplicate, mergeQuantidade } = useProducts();
  const { filters, filtered, setFilter, setStatus, toggleSort, reset, isActive } = useFilters(products);

  const [addOpen, setAddOpen]       = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting]     = useState(false);

  // Estado para controle de duplicata
  const [duplicatePending, setDuplicatePending] = useState<{
    existing: Product;
    formData: ProductFormData;
  } | null>(null);
  const [merging, setMerging]     = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (filtered.length === 0) return;
    setExporting(true);
    try {
      const STATUS_LABEL: Record<string, string> = {
        all:     "Todos",
        vencido: "Vencidos",
        proximo: "Próximos do vencimento",
        ok:      "Dentro da validade",
      };
      const filterLabel = [
        filters.search && `Busca: "${filters.search}"`,
        filters.status !== "all" && STATUS_LABEL[filters.status],
      ].filter(Boolean).join(" · ") || "Todos";
      await exportFilteredToExcel(filtered, filterLabel);
    } finally {
      setExporting(false);
    }
  };

  const stats = useMemo(() => {
    const c = { total: products.length, vencido: 0, proximo: 0, ok: 0 };
    for (const p of products) c[getProductValidade(p).status]++;
    return c;
  }, [products]);

  const handleAdd = async (data: ProductFormData) => {
    // Verifica duplicata apenas quando há código de barras
    if (data.codigoBarras) {
      const existing = await findDuplicate(data.codigoBarras, data.dataValidade);
      if (existing) {
        // Fecha o modal de cadastro e abre o dialog de duplicata
        setAddOpen(false);
        setDuplicatePending({ existing, formData: data });
        return;
      }
    }
    await addProduct(data);
    setAddOpen(false);
  };

  const handleMergeConfirm = async () => {
    if (!duplicatePending) return;
    setMerging(true);
    try {
      await mergeQuantidade(duplicatePending.existing.id, duplicatePending.formData.quantidade);
      setDuplicatePending(null);
    } finally {
      setMerging(false);
    }
  };

  const handleEdit = async (data: ProductFormData) => {
    if (!editTarget) return;
    await updateProduct(editTarget.id, data);
    setEditTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeProduct(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      {/* Título */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Produtos</h1>
          <p className="text-sm text-[var(--color-text-soft)] mt-0.5">
            Controle de validade do estoque
          </p>
        </div>
        {products.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={<FileDown size={15} />}
              onClick={handleExport}
              loading={exporting}
              disabled={filtered.length === 0}
              title={
                filtered.length === 0
                  ? "Nenhum produto para exportar"
                  : `Exportar ${filtered.length} produto${filtered.length !== 1 ? "s" : ""}`
              }
            >
              {isActive
                ? `Exportar ${filtered.length} produto${filtered.length !== 1 ? "s" : ""}`
                : "Exportar Excel"}
            </Button>
            <Button icon={<Plus size={15} />} onClick={() => setAddOpen(true)}>
              Cadastrar Produto
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total de Produtos"
          value={stats.total}
          icon={<Package size={18} />}
          accentColor="var(--color-blue)"
          lightColor="var(--color-blue-light)"
          description={stats.total === 0 ? "Nenhum produto cadastrado." : `${stats.total} produto${stats.total !== 1 ? "s" : ""} no estoque.`}
        />
        <StatCard
          label="Dentro da Validade"
          value={stats.ok}
          icon={<CheckCircle size={18} />}
          accentColor="#16a34a"
          lightColor="#f0fdf4"
          description={stats.ok === 0 ? "Nenhum produto na validade." : `${stats.ok === stats.total ? "Todo o estoque" : `${stats.ok} produto${stats.ok !== 1 ? "s" : ""}`} em condições ideais.`}
        />
        <StatCard
          label="Próximos do Vencimento"
          value={stats.proximo}
          icon={<Clock size={18} />}
          accentColor="#a16207"
          lightColor="var(--color-yellow-light)"
          description={stats.proximo === 0 ? "Nenhum próximo do vencimento." : "Vencem em até 90 dias — priorize."}
        />
        <StatCard
          label="Produtos Vencidos"
          value={stats.vencido}
          icon={<XCircle size={18} />}
          accentColor="var(--color-red)"
          lightColor="var(--color-red-light)"
          description={stats.vencido === 0 ? "Nenhum produto vencido." : "Remova do estoque imediatamente."}
        />
      </div>

      {/* Barra de filtros */}
      {products.length > 0 && (
        <div
          className="bg-white rounded-2xl p-4"
          style={{ boxShadow: "0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.04)", border: "1px solid var(--color-border)" }}
        >
          <ProductFilters
            filters={filters}
            counts={{
              all:     products.length,
              vencido: stats.vencido,
              proximo: stats.proximo,
              ok:      stats.ok,
            }}
            onFilter={setFilter}
            onStatus={setStatus}
            onSort={toggleSort}
            onReset={reset}
            isActive={isActive}
          />
        </div>
      )}

      {/* Tabela */}
      {loading ? (
        <div className="flex items-center justify-center h-40 gap-2 text-[var(--color-text-soft)]">
          <RefreshCw size={16} className="animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      ) : (
        <ProductTable
          products={filtered}
          totalCount={products.length}
          sortBy={filters.sortBy}
          sortDir={filters.sortDir}
          onSort={toggleSort}
          onEdit={(p) => setEditTarget(p)}
          onDelete={(p) => setDeleteTarget(p)}
          onAddFirst={() => setAddOpen(true)}
        />
      )}

      {/* Modal: cadastrar */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Cadastrar produto"
        maxWidth="lg"
      >
        <ProductForm onSubmit={handleAdd} onCancel={() => setAddOpen(false)} />
      </Modal>

      {/* Modal: editar */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Editar produto"
        maxWidth="lg"
      >
        {editTarget && (
          <ProductForm
            defaultValues={editTarget}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
          />
        )}
      </Modal>

      {/* Dialog: produto duplicado */}
      <DuplicateDialog
        open={!!duplicatePending}
        existing={duplicatePending?.existing ?? null}
        newQuantidade={duplicatePending?.formData.quantidade ?? 0}
        onMerge={handleMergeConfirm}
        onCancel={() => setDuplicatePending(null)}
        loading={merging}
      />

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir produto"
        message={`Tem certeza que deseja excluir "${deleteTarget?.descricao}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={deleting}
      />
    </div>
  );
}
