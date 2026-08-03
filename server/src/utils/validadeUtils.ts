/**
 * Regras de negócio de validade de produtos.
 * Toda a lógica reside aqui — um único ponto de verdade no backend.
 */

export type StatusValidade = "vencido" | "proximo" | "ok";
export type CorStatus      = "vermelho" | "amarelo" | "branco";

export interface InfoValidade {
  /** Número de dias até o vencimento (≥ 0). Zero quando já venceu. */
  diasRestantes: number;
  /** Quantos dias o produto está vencido (≥ 0). Zero quando ainda válido. */
  diasVencidos: number;
  /** Status semântico. */
  status: StatusValidade;
  /** Cor de destaque para a interface. */
  corStatus: CorStatus;
  /** Texto descritivo pronto para exibição. */
  textoStatus: string;
}

// ─── Limiares ────────────────────────────────────────────────────────────────

/** Produtos que vencem em até LIMIAR_PROXIMO dias são "próximos do vencimento". */
const LIMIAR_PROXIMO = 90;

// ─── Utilitários internos ─────────────────────────────────────────────────────

/** Diferença em dias inteiros entre duas datas (truncado, sem fuso). */
function diffDias(a: Date, b: Date): number {
  const MS_DIA = 1000 * 60 * 60 * 24;
  // Normalizar para meia-noite local evita erros de DST
  const dA = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const dB = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((dB.getTime() - dA.getTime()) / MS_DIA);
}

function pluralDias(n: number): string {
  return n === 1 ? "1 dia" : `${n} dias`;
}

// ─── Função principal ─────────────────────────────────────────────────────────

export function calcularValidade(dataValidade: Date): InfoValidade {
  const hoje = new Date();
  const diff  = diffDias(hoje, dataValidade); // positivo = futuro, negativo = passado

  // ── Vencido ──────────────────────────────────────────────────────────────
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

  // ── Vence hoje ───────────────────────────────────────────────────────────
  if (diff === 0) {
    return {
      diasRestantes: 0,
      diasVencidos:  0,
      status:     "proximo",
      corStatus:  "amarelo",
      textoStatus: "Vence hoje!",
    };
  }

  // ── Próximo do vencimento (1 – 90 dias) ──────────────────────────────────
  if (diff <= LIMIAR_PROXIMO) {
    return {
      diasRestantes: diff,
      diasVencidos:  0,
      status:     "proximo",
      corStatus:  "amarelo",
      textoStatus: `Faltam ${pluralDias(diff)}.`,
    };
  }

  // ── Dentro da validade (> 90 dias) ───────────────────────────────────────
  return {
    diasRestantes: diff,
    diasVencidos:  0,
    status:     "ok",
    corStatus:  "branco",
    textoStatus: `Restam ${pluralDias(diff)}.`,
  };
}
