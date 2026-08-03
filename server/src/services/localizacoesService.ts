import { db } from "../database/client.js";
import { AppError } from "../middlewares/AppError.js";
import { CreateLocalizacaoInput } from "../validators/localizacaoValidator.js";

export async function listarLocalizacoes() {
  return db.localizacao.findMany({
    orderBy: { codigo: "asc" },
    include: { _count: { select: { produtos: true } } },
  });
}

export async function buscarLocalizacaoPorId(id: number) {
  const localizacao = await db.localizacao.findUnique({
    where: { id },
    include: { _count: { select: { produtos: true } } },
  });

  if (!localizacao) throw AppError.notFound("Localização");

  return localizacao;
}

export async function criarLocalizacao(data: CreateLocalizacaoInput) {
  const existente = await db.localizacao.findUnique({
    where: { codigo: data.codigo },
    select: { id: true },
  });

  if (existente) {
    throw AppError.conflict(`Localização com código "${data.codigo}" já existe`);
  }

  return db.localizacao.create({ data });
}

export async function excluirLocalizacao(id: number): Promise<void> {
  await buscarLocalizacaoPorId(id); // lança 404 se não existir
  await db.localizacao.delete({ where: { id } });
}
