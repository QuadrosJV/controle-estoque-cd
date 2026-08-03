import { GitMerge, Plus, X, Barcode, CalendarDays, Package } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";
import { Product } from "@/types";
import { formatDate } from "@/utils/dateUtils";

interface DuplicateDialogProps {
  open:            boolean;
  existing:        Product | null;
  newQuantidade:   number;
  onMerge:         () => void;
  onCancel:        () => void;
  loading?:        boolean;
}

export default function DuplicateDialog({
  open,
  existing,
  newQuantidade,
  onMerge,
  onCancel,
  loading = false,
}: DuplicateDialogProps) {
  if (!existing) return null;

  const total = existing.quantidade + newQuantidade;

  return (
    <Modal open={open} onClose={onCancel} title="Produto já cadastrado" maxWidth="sm">
      <div className="flex flex-col gap-5">

        {/* Ícone + descrição */}
        <div className="flex gap-3.5">
          <div
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#FFF7ED" }}
          >
            <GitMerge size={18} style={{ color: "#c2410c" }} />
          </div>
          <div className="pt-0.5">
            <p className="text-sm font-semibold text-[var(--color-text)] mb-1">
              Este produto já existe no estoque.
            </p>
            <p className="text-sm text-[var(--color-text-soft)] leading-relaxed">
              Foi encontrado um registro com o mesmo código de barras e data de validade.
              Deseja <strong className="text-[var(--color-text)]">somar a quantidade</strong> ao
              registro existente?
            </p>
          </div>
        </div>

        {/* Card do produto existente */}
        <div
          className="rounded-xl p-4 flex flex-col gap-3"
          style={{ backgroundColor: "#F8FAFC", border: "1px solid var(--color-border)" }}
        >
          <p className="text-xs font-semibold text-[var(--color-text-soft)] uppercase tracking-wider">
            Registro existente
          </p>

          <p className="text-sm font-semibold text-[var(--color-text)]">
            {existing.descricao}
          </p>

          <div className="flex flex-wrap gap-3">
            {existing.codigoBarras && (
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-soft)]"
                style={{ fontFamily: "var(--font-mono)" }}>
                <Barcode size={12} />
                {existing.codigoBarras}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-soft)]">
              <CalendarDays size={12} />
              Validade: <strong>{formatDate(existing.dataValidade)}</strong>
            </span>
          </div>
        </div>

        {/* Prévia da soma */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--color-border)" }}
        >
          <div
            className="px-4 py-2 text-[11px] font-semibold text-[var(--color-text-soft)] uppercase tracking-wider"
            style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid var(--color-border)" }}
          >
            Prévia após atualização
          </div>

          <div className="grid grid-cols-3 divide-x divide-[var(--color-border)]">
            <QuantCell label="Estoque atual" value={existing.quantidade} color="#64748b" />
            <QuantCell label="A adicionar"   value={newQuantidade}       color="#2563eb" icon={<Plus size={11} />} />
            <QuantCell label="Total"         value={total}               color="#16a34a" bold />
          </div>
        </div>

        {/* Nota sobre lotes diferentes */}
        <p className="text-xs text-[var(--color-text-soft)] leading-relaxed"
          style={{ borderLeft: "3px solid var(--color-border)", paddingLeft: "10px" }}>
          Se este produto pertence a um <strong>lote diferente</strong> com outra data de validade,
          cancele e altere a data ao cadastrar.
        </p>

        {/* Ações */}
        <div className="flex gap-2 justify-end pt-1">
          <Button variant="secondary" onClick={onCancel} disabled={loading} icon={<X size={14} />}>
            Cancelar
          </Button>
          <Button
            onClick={onMerge}
            loading={loading}
            icon={<GitMerge size={14} />}
            style={{ backgroundColor: "#c2410c", borderColor: "#c2410c" } as React.CSSProperties}
          >
            Somar quantidade
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function QuantCell({
  label, value, color, icon, bold,
}: {
  label: string; value: number; color: string; icon?: React.ReactNode; bold?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-4 px-3 gap-1">
      <div className="flex items-center gap-0.5" style={{ color }}>
        {icon}
        <span
          className={`text-xl ${bold ? "font-bold" : "font-semibold"}`}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {value.toLocaleString("pt-BR")}
        </span>
      </div>
      <span className="text-[10px] text-[var(--color-text-soft)] text-center leading-tight">
        {label}
      </span>
    </div>
  );
}
