import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "./AppError.js";
import { ApiError } from "../types/api.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // Erros de validação Zod — 422 Unprocessable Entity
  if (err instanceof ZodError) {
    const response: ApiError = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Dados inválidos. Verifique os campos enviados.",
        details: err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    };
    res.status(422).json(response);
    return;
  }

  // Erros de aplicação (AppError)
  if (err instanceof AppError) {
    const response: ApiError = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Erro inesperado — loga e retorna 500
  console.error("[UNHANDLED ERROR]", err);

  const response: ApiError = {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Erro interno do servidor. Tente novamente mais tarde.",
    },
  };
  res.status(500).json(response);
}
