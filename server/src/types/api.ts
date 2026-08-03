// ─── Envelope de resposta padronizado ────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiList<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Códigos de erro semânticos ───────────────────────────────────────────────

export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "BAD_REQUEST"
  | "INTERNAL_ERROR";

// ─── Parâmetros de query padrão ───────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiList<T> | ApiError;
