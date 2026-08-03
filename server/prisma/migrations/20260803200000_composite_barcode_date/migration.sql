-- Remove old single-column unique index on codigo_barras
DROP INDEX IF EXISTS "produtos_codigo_barras_key";

-- Add composite unique index: same barcode + same date = duplicate lot
CREATE UNIQUE INDEX "produtos_codigo_data_unique" ON "produtos"("codigo_barras", "data_validade") WHERE "codigo_barras" IS NOT NULL;
