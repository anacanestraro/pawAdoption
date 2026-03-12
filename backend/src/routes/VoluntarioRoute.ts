import { Router } from "express";
import * as VoluntarioController from "../controllers/VoluntarioController";
import { autenticarJWT } from "../middlewares/auth";

const router = Router();

router.get("/abrigo/:abrigo_id", VoluntarioController.listarVoluntariosDoAbrigo);
router.get("/solicitacoes/:abrigo_id", autenticarJWT, VoluntarioController.listarSolicitacoesPendentes);
router.get("/minhas_solicitacoes", autenticarJWT, VoluntarioController.listarMinhasSolicitacoes);
router.post("/solicitar/:abrigo_id", autenticarJWT, VoluntarioController.solicitarVoluntario);
router.put("/aprovar/:id", autenticarJWT, VoluntarioController.aprovarVoluntario);
router.put("/rejeitar/:id", autenticarJWT, VoluntarioController.rejeitarVoluntario);
router.put("/inativar/:id", autenticarJWT, VoluntarioController.inativarVoluntario);

export default router;