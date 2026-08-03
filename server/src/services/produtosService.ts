import { db } from "../database/client.js";
import { AppError } from "../middlewares/AppError.js";
import { PaginationMeta } from "../types/api.js";
import { calcularValidade, InfoValidade } from "../utils/validadeUtils.js";
import {
  CreateProdutoInput,
  UpdateProdutoInput,
  ProdutoQueryInput,
} from "../validators/produtoValidator.js";

// ─── Tipos internos ───────────────────────────────────────────────────────────

const INCLUDE_RELATIONS = {
  categoria:   { select: { id: true, nome: true } },
  localizacao: { select: { id: true, codigo: true, descricao: true } },
} as const;

type ProdutoDb = Awaited<ReturnType<typeof db.produto.findMany>>[number];

/** Produto enriquecido com campos calculados de validade. */
export type ProdutoComValidade = ProdutoDb & { validade: InfoValidade };

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Aplica calcularValidade sobre um registro do banco e devolve o objeto enriquecido. */
function enriquecerValidade(produto: ProdutoDb): ProdutoComValidade {
  return {
    ...produto,
    validade: calcularValidade(produto.dataValidade),
  };
}

function buildStatusFilter(status: ProdutoQueryInput["status"]) {
  const hoje    = new Date();
  const em90d   = new Date(hoje);
  em90d.setDate(em90d.getDate() + 90);

  if (status === "vencido")  return { dataValidade: { lt: hoje } };
  if (status === "proximo")  return { dataValidade: { gte: hoje, lte: em90d } };
  if (status === "ok")       return { dataValidade: { gt: em90d } };
  return {};
}

function buildSearchFilter(search: string | undefined) {
  if (!search?.trim()) return {};
  return {
    OR: [
      { descricao:    { contains: search } },
      { codigoBarras: { contains: search } },
      { observacoes:  { contains: search } },
    ],
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export async function listarProdutos(query: ProdutoQueryInput): Promise<{
  produtos: ProdutoComValidade[];
  meta: PaginationMeta;
}> {
  const { page, limit, search, categoriaId, status, orderBy, order } = query;

  const where = {
    ...buildSearchFilter(search),
    ...(categoriaId ? { categoriaId } : {}),
    ...buildStatusFilter(status),
  };

  const [total, rows] = await db.$transaction([
    db.produto.count({ where }),
    db.produto.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [orderBy]: order },
      include: INCLUDE_RELATIONS,
    }),
  ]);

  return {
    produtos: rows.map(enriquecerValidade),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function buscarProdutoPorId(id: number): Promise<ProdutoComValidade> {
  const produto = await db.produto.findUnique({
    where: { id },
    include: INCLUDE_RELATIONS,
  });

  if (!produto) throw AppError.notFound("Produto");

  return enriquecerValidade(produto);
}

export async function verificarDuplicata(
  codigoBarras: string,
  dataValidade: string
): Promise<ProdutoComValidade | null> {
  const produto = await db.produto.findFirst({
    where: { codigoBarras, dataValidade: new Date(dataValidade) },
    include: INCLUDE_RELATIONS,
  });
  return produto ? enriquecerValidade(produto) : null;
}

export async function somarQuantidade(
  id: number,
  quantidadeExtra: number
): Promise<ProdutoComValidade> {
  const existente = await buscarProdutoPorId(id);
  const produto = await db.produto.update({
    where: { id },
    data: { quantidade: existente.quantidade + quantidadeExtra },
    include: INCLUDE_RELATIONS,
  });
  return enriquecerValidade(produto);
}

export async function criarProduto(data: CreateProdutoInput): Promise<ProdutoComValidade> {
  // Mesmo barcode + mesma data = mesmo lote — bloqueia no backend também
  if (data.codigoBarras) {
    const duplicata = await verificarDuplicata(data.codigoBarras, data.dataValidade);
    if (duplicata) {
      throw AppError.conflict(
        `Produto com código "${data.codigoBarras}" e esta data de validade já existe (id: ${duplicata.id})`
      );
    }
  }

  const produto = await db.produto.create({
    data: {
      codigoBarras:  data.codigoBarras  ?? null,
      descricao:     data.descricao,
      quantidade:    data.quantidade,
      dataValidade:  new Date(data.dataValidade),
      observacoes:   data.observacoes   ?? null,
      categoriaId:   data.categoriaId   ?? null,
      localizacaoId: data.localizacaoId ?? null,
    },
    include: INCLUDE_RELATIONS,
  });

  return enriquecerValidade(produto);
}

export async function atualizarProduto(
  id: number,
  data: UpdateProdutoInput
): Promise<ProdutoComValidade> {
  await buscarProdutoPorId(id); // lança 404 se não existir

  if (data.codigoBarras) {
    const conflito = await db.produto.findFirst({
      where: { codigoBarras: data.codigoBarras, NOT: { id } },
      select: { id: true },
    });
    if (conflito) {
      throw AppError.conflict(
        `Código de barras "${data.codigoBarras}" já está em uso por outro produto`
      );
    }
  }

  const produto = await db.produto.update({
    where: { id },
    data: {
      ...(data.codigoBarras  !== undefined && { codigoBarras:  data.codigoBarras }),
      ...(data.descricao     !== undefined && { descricao:     data.descricao }),
      ...(data.quantidade    !== undefined && { quantidade:    data.quantidade }),
      ...(data.dataValidade  !== undefined && { dataValidade:  new Date(data.dataValidade) }),
      ...(data.observacoes   !== undefined && { observacoes:   data.observacoes }),
      ...(data.categoriaId   !== undefined && { categoriaId:   data.categoriaId }),
      ...(data.localizacaoId !== undefined && { localizacaoId: data.localizacaoId }),
    },
    include: INCLUDE_RELATIONS,
  });

  return enriquecerValidade(produto);
}

export async function atualizarQuantidade(
  id: number,
  quantidade: number
): Promise<ProdutoComValidade> {
  await buscarProdutoPorId(id);

  const produto = await db.produto.update({
    where: { id },
    data: { quantidade },
    include: INCLUDE_RELATIONS,
  });

  return enriquecerValidade(produto);
}

export async function excluirProduto(id: number): Promise<void> {
  await buscarProdutoPorId(id);
  await db.produto.delete({ where: { id } });
}

export async function obterResumo() {
  const hoje  = new Date();
  const em90d = new Date(hoje);
  em90d.setDate(em90d.getDate() + 90);

  const [total, vencidos, proximos, ok] = await db.$transaction([
    db.produto.count(),
    db.produto.count({ where: { dataValidade: { lt: hoje } } }),
    db.produto.count({ where: { dataValidade: { gte: hoje, lte: em90d } } }),
    db.produto.count({ where: { dataValidade: { gt: em90d } } }),
  ]);

  return { total, vencidos, proximos, ok };
}
