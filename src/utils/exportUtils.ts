import ExcelJS from "exceljs";
import { Product } from "@/types";
import { formatDate, getProductValidade, STATUS_LABELS } from "./dateUtils";

// ─── Paleta de cores por status ───────────────────────────────────────────────

const FILL: Record<string, string> = {
  vencido: "FFFDE8E8",
  proximo: "FFFFF9C4",
  ok:      "FFE8F5E9",
};

const FONT_COLOR: Record<string, string> = {
  vencido: "FFB91C1C",
  proximo: "FF92400E",
  ok:      "FF15803D",
};

const STATUS_PT: Record<string, string> = {
  vencido: "Vencido",
  proximo: "Próximo do vencimento",
  ok:      "Dentro da validade",
};

// ─── Nome de arquivo com data/hora ────────────────────────────────────────────

function buildFilename(prefix: string): string {
  const now   = new Date();
  const d     = now.toLocaleDateString("pt-BR").replace(/\//g, "-");   // DD-MM-YYYY
  const t     = now.toTimeString().slice(0, 5).replace(":", "h");       // HHhMM
  return `${prefix}_${d}_${t}.xlsx`;
}

// ─── Estilo de cabeçalho ──────────────────────────────────────────────────────

function styleHeader(row: ExcelJS.Row): void {
  row.eachCell((cell) => {
    cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A5F" } };
    cell.font      = { bold: true, color: { argb: "FFFFFFFF" }, size: 11, name: "Calibri" };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: false };
    cell.border    = { bottom: { style: "thin", color: { argb: "FF2563EB" } } };
  });
  row.height = 28;
}

// ─── Exportação da tabela filtrada ────────────────────────────────────────────

/**
 * Exporta exatamente os produtos passados (já filtrados/ordenados pela tabela).
 * Colunas: Código de Barras, Descrição, Quantidade, Data de Validade,
 *          Dias Restantes, Status.
 */
export async function exportFilteredToExcel(
  products: Product[],
  filterLabel = "Todos"
): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator  = "Controle de Validade";
  wb.created  = new Date();
  wb.modified = new Date();

  const ws = wb.addWorksheet("Produtos", {
    pageSetup: { paperSize: 9, orientation: "landscape", fitToPage: true, fitToWidth: 1 },
  });

  // ── Colunas ──────────────────────────────────────────────────────────────────
  ws.columns = [
    { header: "Código de Barras", key: "codigoBarras", width: 22 },
    { header: "Descrição",        key: "descricao",    width: 40 },
    { header: "Quantidade",       key: "quantidade",   width: 14 },
    { header: "Data de Validade", key: "dataValidade", width: 18 },
    { header: "Dias Restantes",   key: "diasRestantes",width: 22 },
    { header: "Status",           key: "status",       width: 26 },
  ];

  // ── Cabeçalho ─────────────────────────────────────────────────────────────
  styleHeader(ws.getRow(1));

  // ── Dados ─────────────────────────────────────────────────────────────────
  for (const p of products) {
    const val = getProductValidade(p);

    const row = ws.addRow({
      codigoBarras:  p.codigoBarras ?? "—",
      descricao:     p.descricao,
      quantidade:    p.quantidade,
      dataValidade:  formatDate(p.dataValidade),
      diasRestantes: val.textoStatus,
      status:        STATUS_PT[val.status] ?? STATUS_LABELS[val.status],
    });

    // Fundo da linha por status
    row.eachCell((cell) => {
      cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: FILL[val.status] } };
      cell.alignment = { vertical: "middle", horizontal: "left" };
      cell.border    = { bottom: { style: "hair", color: { argb: "FFE2E8F0" } } };
      cell.font      = { name: "Calibri", size: 11 };
    });

    // Quantidade: centralizada e negrito
    const qtdCell = row.getCell("quantidade");
    qtdCell.alignment = { vertical: "middle", horizontal: "center" };
    qtdCell.font      = { bold: true, name: "Calibri", size: 11 };

    // Dias restantes e status: coloridos
    row.getCell("diasRestantes").font = {
      bold: true, name: "Calibri", size: 11,
      color: { argb: FONT_COLOR[val.status] },
    };
    const statusCell = row.getCell("status");
    statusCell.font      = { bold: true, name: "Calibri", size: 11, color: { argb: FONT_COLOR[val.status] } };
    statusCell.alignment = { vertical: "middle", horizontal: "center" };

    row.height = 22;
  }

  // ── Auto-filtro + congelar cabeçalho ─────────────────────────────────────
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 6 } };
  ws.views = [{ state: "frozen", ySplit: 1 }];

  // ── Aba de resumo ─────────────────────────────────────────────────────────
  const summary = wb.addWorksheet("Resumo");
  summary.columns = [
    { header: "Status",     key: "status",     width: 30 },
    { header: "Quantidade", key: "count",      width: 16 },
    { header: "%",          key: "percentual", width: 10 },
  ];

  styleHeader(summary.getRow(1));

  const counts = { vencido: 0, proximo: 0, ok: 0 };
  for (const p of products) counts[getProductValidade(p).status]++;
  const total = products.length;

  const summaryData = [
    { label: "Vencidos",                key: "vencido"  },
    { label: "Próximos do vencimento",  key: "proximo"  },
    { label: "Dentro da validade",      key: "ok"       },
  ];

  for (const { label, key } of summaryData) {
    const count = counts[key as keyof typeof counts];
    const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
    const row   = summary.addRow({ status: label, count, percentual: `${pct}%` });
    row.eachCell((cell) => {
      cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: FILL[key] } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border    = { bottom: { style: "hair", color: { argb: "FFE2E8F0" } } };
      cell.font      = { name: "Calibri", size: 11 };
    });
    row.getCell("status").font = { bold: true, name: "Calibri", size: 11, color: { argb: FONT_COLOR[key] } };
    row.height = 22;
  }

  const totalRow = summary.addRow({ status: "TOTAL", count: total, percentual: "100%" });
  totalRow.eachCell((cell) => {
    cell.font      = { bold: true, name: "Calibri", size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.fill      = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
    cell.border    = { top: { style: "thin", color: { argb: "FFE2E8F0" } } };
  });
  totalRow.height = 24;

  // Metadado: filtro aplicado
  summary.addRow([]);
  const metaRow = summary.addRow({ status: `Filtro: ${filterLabel}`, count: "", percentual: "" });
  metaRow.getCell("status").font = { italic: true, color: { argb: "FF64748B" }, name: "Calibri", size: 10 };

  // ── Download ──────────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = buildFilename("controle-validade");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Exportação legada (mantida para ReportsPage) ─────────────────────────────
export async function exportToExcel(
  products: Product[],
  filename = "controle-validade"
): Promise<void> {
  return exportFilteredToExcel(products, "Todos");
}
