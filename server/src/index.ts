import "express-async-errors";
import express from "express";
import cors from "cors";
import { connectDatabase, disconnectDatabase } from "./database/client.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFound } from "./middlewares/notFound.js";
import apiRouter from "./routes/index.js";

// ─── App ──────────────────────────────────────────────────────────────────────

const app = express();
const PORT = Number(process.env.PORT ?? 3333);

// ─── Middlewares globais ──────────────────────────────────────────────────────

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      "http://localhost:8443",
      "http://localhost:5173",
      "http://127.0.0.1:8443",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

if (process.env.NODE_ENV !== "test") {
  app.use(requestLogger);
}

// ─── Health check ─────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      environment: process.env.NODE_ENV ?? "development",
      timestamp: new Date().toISOString(),
    },
  });
});

// ─── API v1 ───────────────────────────────────────────────────────────────────

app.use("/api", apiRouter);

// ─── 404 e tratamento de erros ────────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ─── Inicialização com graceful shutdown ──────────────────────────────────────

async function bootstrap(): Promise<void> {
  await connectDatabase();
  console.log("✔ Banco de dados conectado");

  const server = app.listen(PORT, () => {
    console.log(`\n✔ Servidor rodando em http://localhost:${PORT}`);
    console.log(`  Ambiente: ${process.env.NODE_ENV ?? "development"}\n`);
    console.log("  Endpoints disponíveis:");
    console.log("    GET    /health");
    console.log("    ─────────────────────────────");
    console.log("    GET    /api/produtos");
    console.log("    GET    /api/produtos/stats/resumo");
    console.log("    GET    /api/produtos/:id");
    console.log("    POST   /api/produtos");
    console.log("    PUT    /api/produtos/:id");
    console.log("    PATCH  /api/produtos/:id/quantidade");
    console.log("    DELETE /api/produtos/:id");
    console.log("    ─────────────────────────────");
    console.log("    GET    /api/categorias");
    console.log("    GET    /api/categorias/:id");
    console.log("    POST   /api/categorias");
    console.log("    DELETE /api/categorias/:id");
    console.log("    ─────────────────────────────");
    console.log("    GET    /api/localizacoes");
    console.log("    GET    /api/localizacoes/:id");
    console.log("    POST   /api/localizacoes");
    console.log("    DELETE /api/localizacoes/:id\n");
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} recebido. Encerrando servidor...`);
    server.close(async () => {
      await disconnectDatabase();
      console.log("✔ Conexão com banco encerrada. Bye!");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT",  () => shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  console.error("✘ Falha ao iniciar o servidor:", err);
  process.exit(1);
});
