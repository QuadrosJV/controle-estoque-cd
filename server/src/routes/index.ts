import { Router } from "express";
import produtosRouter    from "./produtos.js";
import categoriasRouter  from "./categorias.js";
import localizacoesRouter from "./localizacoes.js";

const router: Router = Router();

router.use("/produtos",     produtosRouter);
router.use("/categorias",   categoriasRouter);
router.use("/localizacoes", localizacoesRouter);

export default router;
