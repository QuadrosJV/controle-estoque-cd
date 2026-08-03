import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Barcode, FileText, Hash, Calendar, StickyNote, ScanLine } from "lucide-react";
import { Product, ProductFormData } from "@/types";
import Button from "@/components/ui/Button";

// ─── Schema de validação ──────────────────────────────────────────────────────

const schema = z.object({
  codigoBarras: z
    .string()
    .max(50, "Código deve ter no máximo 50 caracteres")
    .optional()
    .or(z.literal("")),

  descricao: z
    .string()
    .min(2, "A descrição deve ter ao menos 2 caracteres")
    .max(255, "A descrição deve ter no máximo 255 caracteres")
    .trim(),

  quantidade: z
    .string()
    .min(1, "Informe a quantidade")
    .transform((v) => parseInt(v, 10))
    .refine((v) => !isNaN(v) && v >= 0, "A quantidade não pode ser negativa"),

  dataValidade: z
    .string()
    .min(1, "Informe a data de validade"),

  observacoes: z.string().max(1000, "Observações devem ter no máximo 1000 caracteres").optional(),
});

type FormValues = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

// ─── Estilos internos ─────────────────────────────────────────────────────────

const fieldWrapClass = "flex flex-col gap-1.5";
const labelClass = "text-sm font-medium text-[var(--color-text)]";
const requiredMark = <span className="text-[var(--color-red)] ml-0.5">*</span>;

const inputBaseClass = `
  w-full rounded-lg border bg-white text-sm text-[var(--color-text)]
  placeholder:text-[var(--color-text-soft)]
  focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/25 focus:border-[var(--color-blue)]
  transition-colors
`;

function FieldIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-soft)]">
      {children}
    </div>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-[var(--color-red)] flex items-center gap-1 mt-0.5">{msg}</p>;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductFormProps {
  defaultValues?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProductForm({ defaultValues, onSubmit, onCancel }: ProductFormProps) {
  const barcodeRef = useRef<HTMLInputElement>(null);
  const descricaoRef = useRef<HTMLInputElement>(null);
  const isEditing = !!defaultValues;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? {
          codigoBarras: defaultValues.codigoBarras ?? "",
          descricao: defaultValues.descricao,
          quantidade: String(defaultValues.quantidade),
          dataValidade: defaultValues.dataValidade,
          observacoes: defaultValues.observacoes ?? "",
        }
      : {
          codigoBarras: "",
          descricao: "",
          quantidade: "",
          dataValidade: "",
          observacoes: "",
        },
  });

  // Auto-foco no código de barras ao abrir
  useEffect(() => {
    const timer = setTimeout(() => setFocus("codigoBarras"), 80);
    return () => clearTimeout(timer);
  }, [setFocus]);

  // Suporte a leitores USB: ao pressionar Enter no campo de barras, avança o foco
  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      descricaoRef.current?.focus();
    }
  };

  const submit = async (values: FormOutput) => {
    await onSubmit({
      codigoBarras: values.codigoBarras?.trim() || null,
      descricao: values.descricao,
      quantidade: values.quantidade as number,
      dataValidade: values.dataValidade,
      observacoes: values.observacoes?.trim() || null,
    });
  };

  // Registro dos campos que precisam de ref dupla (form + DOM manual)
  const { ref: barcodeFormRef, ...barcodeRest }   = register("codigoBarras");
  const { ref: descricaoFormRef, ...descricaoRest } = register("descricao");

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-5">

      {/* Código de Barras */}
      <div className={fieldWrapClass}>
        <label className={labelClass}>
          Código de Barras
          <span
            className="ml-2 text-[10px] font-normal text-[var(--color-text-soft)] bg-[var(--color-gray-light)] border border-[var(--color-border)] px-1.5 py-0.5 rounded"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <ScanLine size={9} className="inline mr-1 -mt-0.5" />
            leitor USB
          </span>
        </label>
        <div className="relative">
          <FieldIcon><Barcode size={15} /></FieldIcon>
          <input
            {...barcodeRest}
            ref={(el) => {
              barcodeFormRef(el);
              (barcodeRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Ex: 7891000100103 ou leia com o scanner"
            onKeyDown={handleBarcodeKeyDown}
            className={`${inputBaseClass} h-10 pl-9 pr-3 ${
              errors.codigoBarras ? "border-[var(--color-red)]" : "border-[var(--color-border)]"
            }`}
          />
        </div>
        <p className="text-[11px] text-[var(--color-text-soft)]">
          Opcional — passe o leitor de código de barras ou digite manualmente.
        </p>
        <ErrorMsg msg={errors.codigoBarras?.message} />
      </div>

      {/* Descrição */}
      <div className={fieldWrapClass}>
        <label htmlFor="descricao" className={labelClass}>
          Descrição {requiredMark}
        </label>
        <div className="relative">
          <FieldIcon><FileText size={15} /></FieldIcon>
          <input
            {...descricaoRest}
            ref={(el) => {
              descricaoFormRef(el);
              (descricaoRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
            }}
            id="descricao"
            type="text"
            placeholder="Ex: Chocolate ao Leite Nestlé 90g"
            className={`${inputBaseClass} h-10 pl-9 pr-3 ${
              errors.descricao ? "border-[var(--color-red)]" : "border-[var(--color-border)]"
            }`}
          />
        </div>
        <ErrorMsg msg={errors.descricao?.message} />
      </div>

      {/* Quantidade + Data de Validade */}
      <div className="grid grid-cols-2 gap-4">
        <div className={fieldWrapClass}>
          <label htmlFor="quantidade" className={labelClass}>
            Quantidade {requiredMark}
          </label>
          <div className="relative">
            <FieldIcon><Hash size={15} /></FieldIcon>
            <input
              {...register("quantidade")}
              id="quantidade"
              type="number"
              min={0}
              step={1}
              placeholder="Ex: 120"
              className={`${inputBaseClass} h-10 pl-9 pr-3 ${
                errors.quantidade ? "border-[var(--color-red)]" : "border-[var(--color-border)]"
              }`}
            />
          </div>
          <ErrorMsg msg={errors.quantidade?.message} />
        </div>

        <div className={fieldWrapClass}>
          <label htmlFor="dataValidade" className={labelClass}>
            Data de Validade {requiredMark}
          </label>
          <div className="relative">
            <FieldIcon><Calendar size={15} /></FieldIcon>
            <input
              {...register("dataValidade")}
              id="dataValidade"
              type="date"
              className={`${inputBaseClass} h-10 pl-9 pr-3 ${
                errors.dataValidade ? "border-[var(--color-red)]" : "border-[var(--color-border)]"
              }`}
            />
          </div>
          <ErrorMsg msg={errors.dataValidade?.message} />
        </div>
      </div>

      {/* Observações */}
      <div className={fieldWrapClass}>
        <label htmlFor="observacoes" className={labelClass}>
          <StickyNote size={14} className="inline mr-1.5 -mt-0.5 text-[var(--color-text-soft)]" />
          Observações
          <span className="ml-2 text-[11px] font-normal text-[var(--color-text-soft)]">opcional</span>
        </label>
        <textarea
          {...register("observacoes")}
          id="observacoes"
          rows={3}
          placeholder="Informações adicionais sobre este produto..."
          className={`
            w-full rounded-lg border bg-white text-sm text-[var(--color-text)] px-3 py-2.5
            placeholder:text-[var(--color-text-soft)] resize-none
            focus:outline-none focus:ring-2 focus:ring-[var(--color-blue)]/25 focus:border-[var(--color-blue)]
            transition-colors
            ${errors.observacoes ? "border-[var(--color-red)]" : "border-[var(--color-border)]"}
          `}
        />
        <ErrorMsg msg={errors.observacoes?.message} />
      </div>

      {/* Rodapé */}
      <div
        className="flex items-center justify-between pt-4 gap-3"
        style={{ borderTop: "1px solid var(--color-border)" }}
      >
        <p className="text-xs text-[var(--color-text-soft)]">
          <span className="text-[var(--color-red)]">*</span> Campos obrigatórios
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEditing ? "Salvar alterações" : "Salvar produto"}
          </Button>
        </div>
      </div>
    </form>
  );
}
