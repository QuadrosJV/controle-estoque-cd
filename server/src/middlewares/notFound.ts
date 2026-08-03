import { Request, Response } from "express";
import { ApiError } from "../types/api.js";

export function notFound(_req: Request, res: Response): void {
  const response: ApiError = {
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Rota não encontrada.",
    },
  };
  res.status(404).json(response);
}
