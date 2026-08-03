import { db } from "../database/client.js";
import { AppError } from "../middlewares/AppError.js";
import { CreateCategoriaInput } from "../validators/categoriaValidator.js";

export async function listarCategorias() {
  return db.categoria.findMany({
    orderBy: { nome: "asc" },
    include: { _count: { select: { produtos: true } } },
  });
}

export async function buscarCategoriaPorId(id: number) {
  const categoria = await db.categoria.findUnique({
    where: { id },
    include: { _count: { select: { produtos: true } } },
  });

  if (!categoria) throw AppError.notFound("Categoria");

  return categoria;
}

export async function criarCategoria(data: CreateCategoriaInput) {
  const existente = await db.categoria.findUnique({
    where: { nome: data.nome },
    select: { id: true },
  });

  if (existente) {
    throw AppError.conflict(`Categoria "${data.nome}" já existe`);
  }

  return db.categoria.create({ data });
}

export async function excluirCategoria(id: number): Promise<void> {
  await buscarCategoriaPorId(id); // lança 404 se não existir
  await db.categoria.delete({ where: { id } });
}
