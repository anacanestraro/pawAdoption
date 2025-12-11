import { Router } from "express";
import * as ValidacaoController from "../controllers/ValidacaoController";
import { autenticarJWT } from "../middlewares/auth";

const router = Router();

router.get("/", ValidacaoController.listarValidacoes);

export default router;