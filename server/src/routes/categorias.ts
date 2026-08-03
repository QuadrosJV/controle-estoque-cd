import { Router } from "express";
import * as controller from "../controllers/categoriasController.js";

const router: Router = Router();

router.get("/",      controller.listar);
router.get("/:id",   controller.buscarPorId);
router.post("/",     controller.criar);
router.delete("/:id", controller.excluir);

export default router;
