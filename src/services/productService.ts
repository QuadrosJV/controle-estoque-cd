import { Product, ProductFormData, InfoValidade } from "@/types";
import { calcularValidade } from "@/utils/dateUtils";

// ─── Interface pública ────────────────────────────────────────────────────────

export interface IProductService {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | null>;
  create(data: ProductFormData): Promise<Product>;
  update(id: string, data: Partial<ProductFormData>): Promise<Product>;
  remove(id: string): Promise<void>;
  /** Retorna o produto existente se já houver um com mesmo código + mesma data, senão null. */
  findDuplicate(codigoBarras: string, dataValidade: string): Promise<Product | null>;
  /** Soma quantidadeExtra à quantidade atual do produto e retorna o registro atualizado. */
  mergeQuantidade(id: string, quantidadeExtra: number): Promise<Product>;
}

// ─── Implementação LocalStorage ───────────────────────────────────────────────

const STORAGE_KEY = "expiry_control_products_v2";
const LEGACY_KEYS = ["expiry_control_products"];

function purgeLegacyData(): void {
  for (const key of LEGACY_KEYS) localStorage.removeItem(key);
}

function isValidProduct(p: unknown): p is Product {
  if (!p || typeof p !== "object") return false;
  const obj = p as Record<string, unknown>;
  return typeof obj.descricao === "string" && typeof obj.dataValidade === "string";
}

function loadFromStorage(): Product[] {
  purgeLegacyData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as unknown[]).filter(isValidProduct);
  } catch {
    return [];
  }
}

function saveToStorage(products: Product[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

class LocalStorageProductService implements IProductService {
  async getAll(): Promise<Product[]> {
    return loadFromStorage();
  }

  async getById(id: string): Promise<Product | null> {
    return loadFromStorage().find((p) => p.id === id) ?? null;
  }

  async findDuplicate(codigoBarras: string, dataValidade: string): Promise<Product | null> {
    if (!codigoBarras) return null;
    return (
      loadFromStorage().find(
        (p) => p.codigoBarras === codigoBarras && p.dataValidade === dataValidade
      ) ?? null
    );
  }

  async mergeQuantidade(id: string, quantidadeExtra: number): Promise<Product> {
    const products = loadFromStorage();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Produto ${id} não encontrado`);
    const updated: Product = {
      ...products[index],
      quantidade: products[index].quantidade + quantidadeExtra,
      updatedAt: new Date().toISOString(),
    };
    updated.validade = calcularValidade(updated.dataValidade);
    products[index] = updated;
    saveToStorage(products);
    return updated;
  }

  async create(data: ProductFormData): Promise<Product> {
    const products = loadFromStorage();
    const now = new Date().toISOString();
    const product: Product = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      validade: calcularValidade(data.dataValidade),
    };
    products.push(product);
    saveToStorage(products);
    return product;
  }

  async update(id: string, data: Partial<ProductFormData>): Promise<Product> {
    const products = loadFromStorage();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Produto ${id} não encontrado`);
    const updated: Product = {
      ...products[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    updated.validade = calcularValidade(updated.dataValidade);
    products[index] = updated;
    saveToStorage(products);
    return updated;
  }

  async remove(id: string): Promise<void> {
    saveToStorage(loadFromStorage().filter((p) => p.id !== id));
  }
}

// ─── Implementação REST API ───────────────────────────────────────────────────

const API_BASE = "/api";

function mapApiToProduct(p: Record<string, unknown>): Product {
  const dataValidade = (p.dataValidade as string ?? "").split("T")[0];
  const validade = (p.validade as InfoValidade | undefined) ?? calcularValidade(dataValidade);
  return {
    id:           String(p.id),
    codigoBarras: (p.codigoBarras as string | null) ?? null,
    descricao:    (p.descricao as string) ?? "",
    quantidade:   Number(p.quantidade ?? 0),
    dataValidade,
    observacoes:  (p.observacoes as string | null) ?? null,
    createdAt:    p.createdAt as string,
    updatedAt:    p.updatedAt as string,
    validade,
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

class ApiProductService implements IProductService {
  async getAll(): Promise<Product[]> {
    const result = await apiFetch<{ data: Record<string, unknown>[] }>("/produtos?limit=200");
    return result.data.map(mapApiToProduct);
  }

  async getById(id: string): Promise<Product | null> {
    try {
      const res = await apiFetch<{ data: Record<string, unknown> }>(`/produtos/${id}`);
      return mapApiToProduct(res.data);
    } catch {
      return null;
    }
  }

  async findDuplicate(codigoBarras: string, dataValidade: string): Promise<Product | null> {
    if (!codigoBarras) return null;
    const res = await apiFetch<{ data: Record<string, unknown> | null }>(
      `/produtos/verificar-duplicata?codigoBarras=${encodeURIComponent(codigoBarras)}&dataValidade=${encodeURIComponent(dataValidade)}`
    );
    return res.data ? mapApiToProduct(res.data) : null;
  }

  async mergeQuantidade(id: string, quantidadeExtra: number): Promise<Product> {
    const res = await apiFetch<{ data: Record<string, unknown> }>(`/produtos/${id}/somar-quantidade`, {
      method: "PATCH",
      body: JSON.stringify({ quantidade: quantidadeExtra }),
    });
    return mapApiToProduct(res.data);
  }

  async create(data: ProductFormData): Promise<Product> {
    const res = await apiFetch<{ data: Record<string, unknown> }>("/produtos", {
      method: "POST",
      body: JSON.stringify({
        codigoBarras:  data.codigoBarras  ?? null,
        descricao:     data.descricao,
        quantidade:    data.quantidade,
        dataValidade:  data.dataValidade,
        observacoes:   data.observacoes   ?? null,
      }),
    });
    return mapApiToProduct(res.data);
  }

  async update(id: string, data: Partial<ProductFormData>): Promise<Product> {
    const res = await apiFetch<{ data: Record<string, unknown> }>(`/produtos/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        ...(data.codigoBarras  !== undefined && { codigoBarras:  data.codigoBarras }),
        ...(data.descricao     !== undefined && { descricao:     data.descricao }),
        ...(data.quantidade    !== undefined && { quantidade:    data.quantidade }),
        ...(data.dataValidade  !== undefined && { dataValidade:  data.dataValidade }),
        ...(data.observacoes   !== undefined && { observacoes:   data.observacoes }),
      }),
    });
    return mapApiToProduct(res.data);
  }

  async remove(id: string): Promise<void> {
    await apiFetch(`/produtos/${id}`, { method: "DELETE" });
  }
}

// ─── Exportação ───────────────────────────────────────────────────────────────

const useApi = import.meta.env.VITE_USE_API === "true";

export const productService: IProductService = useApi
  ? new ApiProductService()
  : new LocalStorageProductService();
