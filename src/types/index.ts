// ─── Status de validade ───────────────────────────────────────────────────────
// Espelha StatusValidade do servidor (server/src/utils/validadeUtils.ts)

export type ExpiryStatus = "vencido" | "proximo" | "ok";
export type CorStatus    = "vermelho" | "amarelo" | "branco";

/** Campos calculados de validade — retornados prontos pela API. */
export interface InfoValidade {
  diasRestantes: number;
  diasVencidos:  number;
  status:        ExpiryStatus;
  corStatus:     CorStatus;
  textoStatus:   string;
}

// ─── Produto ──────────────────────────────────────────────────────────────────
// Alinhado com o schema Prisma + campos computados da API.

export interface Product {
  id:           string;
  codigoBarras?: string | null;
  descricao:    string;
  quantidade:   number;
  dataValidade: string;           // YYYY-MM-DD
  observacoes?: string | null;
  createdAt:    string;
  updatedAt:    string;
  /** Presente quando o dado vem da API REST; calculado localmente no LocalStorage mode. */
  validade?:    InfoValidade;
}

export type ProductFormData = Omit<Product, "id" | "createdAt" | "updatedAt" | "validade">;

export interface FilterState {
  search:  string;
  status:  ExpiryStatus | "all";
  sortBy:  "dataValidade" | "descricao" | "quantidade" | "updatedAt";
  sortDir: "asc" | "desc";
}

export interface DashboardStats {
  total:   number;
  vencido: number;
  proximo: number;
  ok:      number;
}
