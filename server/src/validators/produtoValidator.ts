import { z } from "zod";

export const createProdutoSchema = z.object({
  codigoBarras: z
    .string()
    .min(1, "Código de barras não pode ser vazio")
    .max(50)
    .optional()
    .nullable(),

  descricao: z
    .string({ required_error: "Descrição é obrigatória" })
    .min(2, "Descrição deve ter ao menos 2 caracteres")
    .max(255, "Descrição deve ter no máximo 255 caracteres")
    .trim(),

  quantidade: z
    .number({ required_error: "Quantidade é obrigatória" })
    .int("Quantidade deve ser um número inteiro")
    .min(0, "Quantidade não pode ser negativa"),

  dataValidade: z
    .string({ required_error: "Data de validade é obrigatória" })
    .refine((v) => !isNaN(Date.parse(v)), { message: "Data de validade inválida" }),

  observacoes: z
    .string()
    .max(1000, "Observações devem ter no máximo 1000 caracteres")
    .optional()
    .nullable(),

  categoriaId: z.number().int().positive().optional().nullable(),
  localizacaoId: z.number().int().positive().optional().nullable(),
});

export const updateProdutoSchema = createProdutoSchema.partial();

export const produtoIdSchema = z.object({
  id: z.coerce.number().int().positive("ID deve ser um número positivo"),
});

export const produtoQuerySchema = z.object({
  page:       z.coerce.number().int().min(1).default(1),
  limit:      z.coerce.number().int().min(1).max(200).default(50),
  search:     z.string().trim().optional(),
  categoriaId: z.coerce.number().int().positive().optional(),
  status:     z.enum(["vencido", "proximo", "ok"]).optional(),
  orderBy:    z
    .enum(["dataValidade", "descricao", "quantidade", "createdAt"])
    .default("dataValidade"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export const patchQuantidadeSchema = z.object({
  quantidade: z
    .number({ required_error: "Quantidade é obrigatória" })
    .int("Deve ser um número inteiro")
    .min(0, "Não pode ser negativa"),
});

export type CreateProdutoInput = z.infer<typeof createProdutoSchema>;
export type UpdateProdutoInput = z.infer<typeof updateProdutoSchema>;
export type ProdutoQueryInput  = z.infer<typeof produtoQuerySchema>;
