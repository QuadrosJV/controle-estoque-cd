import { Request, Response } from "express";
import {
  createLocalizacaoSchema,
  localizacaoIdSchema,
} from "../validators/localizacaoValidator.js";
import * as service from "../services/localizacoesService.js";
import { ApiSuccess, ApiList } from "../types/api.js";

// GET /localizacoes
export async function listar(_req: Request, res: Response): Promise<void> {
  const localizacoes = await service.listarLocalizacoes();

  const response: ApiList<(typeof localizacoes)[number]> = {
    success: true,
    data: localizacoes,
    meta: {
      total: localizacoes.length,
      page: 1,
      limit: localizacoes.length,
      totalPages: 1,
    },
  };

  res.json(response);
}

// GET /localizacoes/:id
export async function buscarPorId(req: Request, res: Response): Promise<void> {
  const { id } = localizacaoIdSchema.parse(req.params);
  const localizacao = await service.buscarLocalizacaoPorId(id);

  const response: ApiSuccess<typeof localizacao> = {
    success: true,
    data: localizacao,
  };

  res.json(response);
}

// POST /localizacoes
export async function criar(req: Request, res: Response): Promise<void> {
  const data = createLocalizacaoSchema.parse(req.body);
  const localizacao = await service.criarLocalizacao(data);

  const response: ApiSuccess<typeof localizacao> = {
    success: true,
    data: localizacao,
    message: "Localização criada com sucesso",
  };

  res.status(201).json(response);
}

// DELETE /localizacoes/:id
export async function excluir(req: Request, res: Response): Promise<void> {
  const { id } = localizacaoIdSchema.parse(req.params);
  await service.excluirLocalizacao(id);

  const response: ApiSuccess<null> = {
    success: true,
    data: null,
    message: "Localização excluída com sucesso",
  };

  res.json(response);
}
