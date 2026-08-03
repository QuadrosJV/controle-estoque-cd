import { z } from "zod";

export const createLocalizacaoSchema = z.object({
  codigo: z
    .string({ required_error: "Código é obrigatório" })
    .min(1)
    .max(20, "Código deve ter no máximo 20 caracteres")
    .trim()
    .toUpperCase(),
  descricao: z.string().max(255).optional(),
});

export const localizacaoIdSchema = z.object({
  id: z.coerce.number().int().positive("ID deve ser um número positivo"),
});

export type CreateLocalizacaoInput = z.infer<typeof createLocalizacaoSchema>;
