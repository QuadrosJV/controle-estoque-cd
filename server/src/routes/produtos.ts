import { Router } from "express";
import * as controller from "../controllers/produtosController.js";

const router: Router = Router();

// Rotas fixas — devem vir antes de /:id
router.get("/stats/resumo",          controller.resumo);
router.get("/verificar-duplicata",   controller.verificarDuplicata);

router.get("/",    controller.listar);
router.get("/:id", controller.buscarPorId);
router.post("/",   controller.criar);
router.put("/:id", controller.atualizar);
router.patch("/:id/quantidade",       controller.atualizarQuantidade);
router.patch("/:id/somar-quantidade", controller.somarQuantidade);
router.delete("/:id", controller.excluir);

export default router;
