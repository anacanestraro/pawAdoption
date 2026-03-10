import { Router } from "express";
import * as VoluntarioController from "../controllers/VoluntarioController";
import { autenticarJWT } from "../middlewares/auth";

const router = Router();

router.get("/listarVoluntariosAbrigo/:abrigo_id", VoluntarioController.listarVoluntariosDoAbrigo);

export default router;