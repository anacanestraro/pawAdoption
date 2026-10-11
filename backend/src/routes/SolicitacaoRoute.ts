import { Router } from "express";
import * as SolicitacaoController from "../controllers/SolicitacaoAdocaoController";
import { autenticarJWT } from "../middlewares/auth";

const router = Router();

router.get("/", SolicitacaoController.listarSolicitacoes);
router.get("/minhas", autenticarJWT, SolicitacaoController.listarMinhasSolicitacoes);
router.get("/recebidas", autenticarJWT, SolicitacaoController.listarSolicitacoesRecebidas);
router.post("/solicitarAdocao/:id", autenticarJWT, SolicitacaoController.solicitarAdocao);
router.put("/atualizarSolicitacao/:id", autenticarJWT, SolicitacaoController.atualizarSolicitacao);


export default router;