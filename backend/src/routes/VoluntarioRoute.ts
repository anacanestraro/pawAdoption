import { Router } from "express";
import * as VoluntarioController from "../controllers/VoluntarioController";
import { autenticarJWT } from "../middlewares/auth";

const router = Router();

router.get("/abrigo/:abrigo_id", VoluntarioController.listarVoluntariosDoAbrigo);
router.get("/solicitacoes/:abrigo_id", autenticarJWT, VoluntarioController.listarSolicitacoesPendentes);

export default router;