export interface CreateProdutoDTO {
  codigoBarras?: string | null;
  descricao: string;
  quantidade: number;
  dataValidade: string; // ISO 8601: "2025-12-31" ou "2025-12-31T00:00:00.000Z"
  observacoes?: string | null;
  categoriaId?: number | null;
  localizacaoId?: number | null;
}

export type UpdateProdutoDTO = Partial<CreateProdutoDTO>;

export interface ProdutoFilters {
  search?: string;
  categoriaId?: number;
  status?: "vencido" | "proximo" | "ok";
  orderBy?: "dataValidade" | "descricao" | "quantidade" | "createdAt";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}
