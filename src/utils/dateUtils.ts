import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExpiryStatus, InfoValidade, CorStatus } from "@/types";

// ─── Limiares (iguais ao backend) ─────────────────────────────────────────────
const LIMIAR_PROXIMO = 90;

// ─── Utilitários básicos ──────────────────────────────────────────────────────

function diffDias(a: Date, b: Date): number {
  const MS_DIA = 1000 * 60 * 60 * 24;
  const dA = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const dB = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((dB.getTime() - dA.getTime()) / MS_DIA);
}

function pluralDias(n: number): string {
  return n === 1 ? "1 dia" : `${n} dias`;
}

function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  // Suporta tanto "YYYY-MM-DD" quanto ISO full com timezone
  const d = dateStr.length === 10
    ? new Date(dateStr + "T00:00:00")
    : parseISO(dateStr);
  return isValid(d) ? d : null;
}

// ─── Cálculo central de validade (espelha o backend) ─────────────────────────

export function calcularValidade(
  dataValidade: string | null | undefined
): InfoValidade {
  const date = parseDate(dataValidade);
  if (!date) {
    return {
      diasRestantes: 0,
      diasVencidos:  0,
      status:        "ok",
      corStatus:     "branco",
      textoStatus:   "Data não informada.",
    };
  }

  const hoje = new Date();
  const diff = diffDias(hoje, date); // positivo = futuro

  if (diff < 0) {
    const diasVencidos = Math.abs(diff);
    return {
      diasRestantes: 0,
      diasVencidos,
      status:     "vencido",
      corStatus:  "vermelho",
      textoStatus: `Venceu há ${pluralDias(diasVencidos)}.`,
    };
  }

  if (diff === 0) {
    return {
      diasRestantes: 0,
      diasVencidos:  0,
      status:     "proximo",
      corStatus:  "amarelo",
      textoStatus: "Vence hoje!",
    };
  }

  if (diff <= LIMIAR_PROXIMO) {
    return {
      diasRestantes: diff,
      diasVencidos:  0,
      status:     "proximo",
      corStatus:  "amarelo",
      textoStatus: `Faltam ${pluralDias(diff)}.`,
    };
  }

  return {
    diasRestantes: diff,
    diasVencidos:  0,
    status:     "ok",
    corStatus:  "branco",
    textoStatus: `Restam ${pluralDias(diff)}.`,
  };
}

// ─── Helpers para componentes ─────────────────────────────────────────────────

/**
 * Retorna o InfoValidade de um produto.
 * Usa o campo pré-calculado pela API quando disponível,
 * senão calcula localmente (modo LocalStorage).
 */
export function getProductValidade(
  product: { dataValidade?: string | null; validade?: InfoValidade }
): InfoValidade {
  return product.validade ?? calcularValidade(product.dataValidade);
}

export function getExpiryStatus(dateStr: string | null | undefined): ExpiryStatus {
  return calcularValidade(dateStr).status;
}

export function daysUntilExpiry(dateStr: string | null | undefined): number {
  const v = calcularValidade(dateStr);
  return v.status === "vencido" ? -v.diasVencidos : v.diasRestantes;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const date = parseDate(dateStr);
  if (!date) return "—";
  return format(date, "dd/MM/yyyy", { locale: ptBR });
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const date = parseDate(dateStr);
  if (!date) return "—";
  return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

// ─── Mapas de UI ──────────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<ExpiryStatus, string> = {
  vencido: "VENCIDO",
  proximo: "PRÓXIMO DO VENCIMENTO",
  ok:      "DENTRO DA VALIDADE",
};

export const COR_TO_TAILWIND: Record<CorStatus, {
  bg: string; text: string; border: string; rowBg: string;
}> = {
  vermelho: {
    bg:     "bg-red-100",
    text:   "text-red-700",
    border: "border-red-300",
    rowBg:  "#FEF2F2",
  },
  amarelo: {
    bg:     "bg-yellow-100",
    text:   "text-yellow-800",
    border: "border-yellow-300",
    rowBg:  "#FEFCE8",
  },
  branco: {
    bg:     "bg-gray-50",
    text:   "text-gray-700",
    border: "border-gray-200",
    rowBg:  "#FFFFFF",
  },
};
