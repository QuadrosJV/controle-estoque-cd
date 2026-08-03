import { Request, Response } from "express";
import {
  createProdutoSchema,
  updateProdutoSchema,
  produtoIdSchema,
  produtoQuerySchema,
  patchQuantidadeSchema,
} from "../validators/produtoValidator.js";
import * as service from "../services/produtosService.js";
import { ApiSuccess, ApiList } from "../types/api.js";

// GET /produtos
export async function listar(req: Request, res: Response): Promise<void> {
  const query = produtoQuerySchema.parse(req.query);
  const { produtos, meta } = await service.listarProdutos(query);

  const response: ApiList<(typeof produtos)[number]> = {
    success: true,
    data: produtos,
    meta,
  };

  res.json(response);
}

// GET /produtos/stats/resumo
export async function resumo(_req: Request, res: Response): Promise<void> {
  const data = await service.obterResumo();

  const response: ApiSuccess<typeof data> = {
    success: true,
    data,
  };

  res.json(response);
}

// GET /produtos/:id
export async function buscarPorId(req: Request, res: Response): Promise<void> {
  const { id } = produtoIdSchema.parse(req.params);
  const produto = await service.buscarProdutoPorId(id);

  const response: ApiSuccess<typeof produto> = {
    success: true,
    data: produto,
  };

  res.json(response);
}

// POST /produtos
export async function criar(req: Request, res: Response): Promise<void> {
  const data = createProdutoSchema.parse(req.body);
  const produto = await service.criarProduto(data);

  const response: ApiSuccess<typeof produto> = {
    success: true,
    data: produto,
    message: "Produto cadastrado com sucesso",
  };

  res.status(201).json(response);
}

// PUT /produtos/:id
export async function atualizar(req: Request, res: Response): Promise<void> {
  const { id } = produtoIdSchema.parse(req.params);
  const data = updateProdutoSchema.parse(req.body);
  const produto = await service.atualizarProduto(id, data);

  const response: ApiSuccess<typeof produto> = {
    success: true,
    data: produto,
    message: "Produto atualizado com sucesso",
  };

  res.json(response);
}

// PATCH /produtos/:id/quantidade
export async function atualizarQuantidade(req: Request, res: Response): Promise<void> {
  const { id } = produtoIdSchema.parse(req.params);
  const { quantidade } = patchQuantidadeSchema.parse(req.body);
  const produto = await service.atualizarQuantidade(id, quantidade);

  const response: ApiSuccess<typeof produto> = {
    success: true,
    data: produto,
    message: "Quantidade atualizada com sucesso",
  };

  res.json(response);
}

// GET /produtos/verificar-duplicata?codigoBarras=X&dataValidade=Y
export async function verificarDuplicata(req: Request, res: Response): Promise<void> {
  const { codigoBarras, dataValidade } = req.query as { codigoBarras?: string; dataValidade?: string };

  if (!codigoBarras || !dataValidade) {
    res.json({ success: true, data: null });
    return;
  }

  const produto = await service.verificarDuplicata(codigoBarras, dataValidade);

  res.json({ success: true, data: produto ?? null });
}

// PATCH /produtos/:id/somar-quantidade
export async function somarQuantidade(req: Request, res: Response): Promise<void> {
  const { id } = produtoIdSchema.parse(req.params);
  const { quantidade } = patchQuantidadeSchema.parse(req.body);
  const produto = await service.somarQuantidade(id, quantidade);

  const response: ApiSuccess<typeof produto> = {
    success: true,
    data: produto,
    message: "Quantidade somada com sucesso",
  };

  res.json(response);
}

// DELETE /produtos/:id
export async function excluir(req: Request, res: Response): Promise<void> {
  const { id } = produtoIdSchema.parse(req.params);
  await service.excluirProduto(id);

  const response: ApiSuccess<null> = {
    success: true,
    data: null,
    message: "Produto excluído com sucesso",
  };

  res.json(response);
}
