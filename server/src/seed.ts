/**
 * Seed inicial — popula o banco com categorias, localizações e produtos de exemplo.
 * Execute: pnpm db:seed
 */
import { db as prisma } from "./database/client.js";

const CATEGORIAS = [
  "Chocolates",
  "Balas e Gomas",
  "Biscoitos e Bolachas",
  "Pirulitos",
  "Chicletes",
  "Fini",
  "Guloseimas",
];

const LOCALIZACOES = [
  { codigo: "A1", descricao: "Corredor A — Prateleira 1" },
  { codigo: "A2", descricao: "Corredor A — Prateleira 2" },
  { codigo: "B1", descricao: "Corredor B — Prateleira 1" },
  { codigo: "B2", descricao: "Corredor B — Prateleira 2" },
  { codigo: "C1", descricao: "Câmara Fria — Setor 1" },
  { codigo: "DEP-01", descricao: "Depósito Principal" },
];

const now = new Date();
const d = (dias: number) => {
  const dt = new Date(now);
  dt.setDate(dt.getDate() + dias);
  return dt;
};

async function main() {
  console.log("🌱 Iniciando seed...");

  // Limpar dados existentes (ordem de FK)
  await prisma.produto.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.localizacao.deleteMany();

  // Categorias
  const cats = await Promise.all(
    CATEGORIAS.map((nome) => prisma.categoria.create({ data: { nome } }))
  );
  console.log(`✔ ${cats.length} categorias criadas`);

  // Localizações
  const locs = await Promise.all(
    LOCALIZACOES.map((l) => prisma.localizacao.create({ data: l }))
  );
  console.log(`✔ ${locs.length} localizações criadas`);

  // Produtos de exemplo (cobre todos os status de validade)
  const produtos = [
    // Vencidos
    { descricao: "Chocolate ao Leite Nestlé 90g", codigoBarras: "7891000100103", quantidade: 48, dataValidade: d(-15), categoriaId: cats[0].id, localizacaoId: locs[0].id, observacoes: "Lote LT-2024-001" },
    { descricao: "Bala Fini Coração Azedo 45g", codigoBarras: "7891234560001", quantidade: 120, dataValidade: d(-3), categoriaId: cats[1].id, localizacaoId: locs[1].id, observacoes: null },
    { descricao: "Biscoito Recheado Oreo 90g", codigoBarras: "7622210444455", quantidade: 24, dataValidade: d(-30), categoriaId: cats[2].id, localizacaoId: locs[5].id, observacoes: "Lote vencido — aguardando devolução" },

    // Próximos do vencimento (≤30 dias)
    { descricao: "Pirulito Chupa Chups Morango", codigoBarras: "8410779000001", quantidade: 200, dataValidade: d(5), categoriaId: cats[3].id, localizacaoId: locs[0].id, observacoes: null },
    { descricao: "Chiclete Trident Menta 5 unid", codigoBarras: "7622210556677", quantidade: 60, dataValidade: d(12), categoriaId: cats[4].id, localizacaoId: locs[2].id, observacoes: null },
    { descricao: "Fini Tubarões de Açúcar 250g", codigoBarras: "8480012345678", quantidade: 80, dataValidade: d(20), categoriaId: cats[5].id, localizacaoId: locs[1].id, observacoes: null },
    { descricao: "Bala Mastigável Juic'y de Tutti-Frutti", codigoBarras: "7891234561002", quantidade: 150, dataValidade: d(28), categoriaId: cats[1].id, localizacaoId: locs[3].id, observacoes: null },

    // Dentro da validade (>30 dias)
    { descricao: "Chocolate Lacta Ao Leite 165g", codigoBarras: "7622210444488", quantidade: 36, dataValidade: d(60), categoriaId: cats[0].id, localizacaoId: locs[0].id, observacoes: null },
    { descricao: "Kit Kat Ao Leite 41,5g", codigoBarras: "7891000315507", quantidade: 96, dataValidade: d(90), categoriaId: cats[0].id, localizacaoId: locs[2].id, observacoes: null },
    { descricao: "Biscoito Wafer Bauducco 140g", codigoBarras: "7896062552789", quantidade: 48, dataValidade: d(120), categoriaId: cats[2].id, localizacaoId: locs[5].id, observacoes: null },
    { descricao: "Guloseima Haribo Ursinho de Ouro 100g", codigoBarras: "4001686303610", quantidade: 72, dataValidade: d(180), categoriaId: cats[6].id, localizacaoId: locs[3].id, observacoes: null },
    { descricao: "M&Ms Amendoim 80g", codigoBarras: "0040000436171", quantidade: 60, dataValidade: d(210), categoriaId: cats[0].id, localizacaoId: locs[4].id, observacoes: "Câmara fria obrigatório" },
    { descricao: "Pirulito Zip de Morango 20g", codigoBarras: "7891234562003", quantidade: 300, dataValidade: d(365), categoriaId: cats[3].id, localizacaoId: locs[0].id, observacoes: null },
    { descricao: "Fini Verme Sour 250g", codigoBarras: "8480012345679", quantidade: 90, dataValidade: d(150), categoriaId: cats[5].id, localizacaoId: locs[1].id, observacoes: null },
    { descricao: "Chiclete Orbit Menta Sem Açúcar", codigoBarras: "7622210667788", quantidade: 144, dataValidade: d(270), categoriaId: cats[4].id, localizacaoId: locs[2].id, observacoes: null },
  ];

  for (const p of produtos) {
    await prisma.produto.create({ data: p });
  }
  console.log(`✔ ${produtos.length} produtos criados`);
  console.log("🎉 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
