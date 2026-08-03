import { useState, useEffect, useCallback } from "react";
import { Product, ProductFormData } from "@/types";
import { productService } from "@/services/productService";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      setError("Erro ao carregar produtos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addProduct = useCallback(async (data: ProductFormData): Promise<Product> => {
    const created = await productService.create(data);
    setProducts((prev) => [...prev, created]);
    return created;
  }, []);

  const updateProduct = useCallback(
    async (id: string, data: Partial<ProductFormData>): Promise<Product> => {
      const updated = await productService.update(id, data);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    },
    []
  );

  const removeProduct = useCallback(async (id: string): Promise<void> => {
    await productService.remove(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const findDuplicate = useCallback(
    async (codigoBarras: string, dataValidade: string) =>
      productService.findDuplicate(codigoBarras, dataValidade),
    []
  );

  const mergeQuantidade = useCallback(
    async (id: string, quantidadeExtra: number): Promise<Product> => {
      const updated = await productService.mergeQuantidade(id, quantidadeExtra);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    },
    []
  );

  return {
    products,
    loading,
    error,
    refresh: load,
    addProduct,
    updateProduct,
    removeProduct,
    findDuplicate,
    mergeQuantidade,
  };
}
