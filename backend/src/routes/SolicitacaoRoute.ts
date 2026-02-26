import { Router } from "express";
import * as SolicitacaoController from "../controllers/SolicitacaoAdocaoController";
import { autenticarJWT } from "../middlewares/auth";

const router = Router();

router.get("/", SolicitacaoController.listarSolicitacoes);

export default router;