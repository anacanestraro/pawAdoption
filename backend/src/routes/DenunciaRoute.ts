import { Router } from "express";
import * as DenunciaController from "../controllers/DenunciaController";
import { autenticarJWT } from "../middlewares/auth";

const router = Router();

router.get("/", DenunciaController.listarDenuncias);
router.post("/denunciar/:id", autenticarJWT, DenunciaController.denunciar);
router.put("/resolverDenuncia/:id", autenticarJWT, DenunciaController.resolverDenuncia);

export default router