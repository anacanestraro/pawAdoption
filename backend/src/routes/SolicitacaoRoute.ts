import { Router } from "express";
import * as SolicitacaoController from "../controllers/SolicitacaoAdocaoController";
import { autenticarJWT } from "../middlewares/auth";

const router = Router();

router.get("/", SolicitacaoController.listarSolicitacoes);
router.post("/solicitarAdocao/:id", autenticarJWT, SolicitacaoController.solicitarAdocao);

export default router;