import { ErrorCode } from "../types/api.js";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;

  constructor(message: string, statusCode = 400, code?: ErrorCode) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code ?? AppError.inferCode(statusCode);
  }

  private static inferCode(status: number): ErrorCode {
    if (status === 404) return "NOT_FOUND";
    if (status === 409) return "CONFLICT";
    if (status === 422) return "VALIDATION_ERROR";
    if (status >= 500) return "INTERNAL_ERROR";
    return "BAD_REQUEST";
  }

  static notFound(resource: string): AppError {
    return new AppError(`${resource} não encontrado(a)`, 404, "NOT_FOUND");
  }

  static conflict(message: string): AppError {
    return new AppError(message, 409, "CONFLICT");
  }

  static badRequest(message: string): AppError {
    return new AppError(message, 400, "BAD_REQUEST");
  }
}
