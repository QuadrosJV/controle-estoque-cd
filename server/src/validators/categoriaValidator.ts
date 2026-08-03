import { z } from "zod";

export const createCategoriaSchema = z.object({
  nome: z
    .string({ required_error: "Nome é obrigatório" })
    .min(2, "Nome deve ter ao menos 2 caracteres")
    .max(100)
    .trim(),
});

export const categoriaIdSchema = z.object({
  id: z.coerce.number().int().positive("ID deve ser um número positivo"),
});

export type CreateCategoriaInput = z.infer<typeof createCategoriaSchema>;
