import { Request, Response } from "express";
import {
  createCategoriaSchema,
  categoriaIdSchema,
} from "../validators/categoriaValidator.js";
import * as service from "../services/categoriasService.js";
import { ApiSuccess, ApiList } from "../types/api.js";

// GET /categorias
export async function listar(_req: Request, res: Response): Promise<void> {
  const categorias = await service.listarCategorias();

  const response: ApiList<(typeof categorias)[number]> = {
    success: true,
    data: categorias,
    meta: {
      total: categorias.length,
      page: 1,
      limit: categorias.length,
      totalPages: 1,
    },
  };

  res.json(response);
}

// GET /categorias/:id
export async function buscarPorId(req: Request, res: Response): Promise<void> {
  const { id } = categoriaIdSchema.parse(req.params);
  const categoria = await service.buscarCategoriaPorId(id);

  const response: ApiSuccess<typeof categoria> = {
    success: true,
    data: categoria,
  };

  res.json(response);
}

// POST /categorias
export async function criar(req: Request, res: Response): Promise<void> {
  const data = createCategoriaSchema.parse(req.body);
  const categoria = await service.criarCategoria(data);

  const response: ApiSuccess<typeof categoria> = {
    success: true,
    data: categoria,
    message: "Categoria criada com sucesso",
  };

  res.status(201).json(response);
}

// DELETE /categorias/:id
export async function excluir(req: Request, res: Response): Promise<void> {
  const { id } = categoriaIdSchema.parse(req.params);
  await service.excluirCategoria(id);

  const response: ApiSuccess<null> = {
    success: true,
    data: null,
    message: "Categoria excluída com sucesso",
  };

  res.json(response);
}
