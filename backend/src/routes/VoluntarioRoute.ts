import { Router } from "express";
import * as VoluntarioController from "../controllers/VoluntarioController";
import { autenticarJWT } from "../middlewares/auth";

const router = Router();

router.get("/", VoluntarioController.listarVoluntarios);

export default router;