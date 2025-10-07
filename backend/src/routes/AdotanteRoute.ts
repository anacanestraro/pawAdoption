import { Router } from "express";
import * as AdotanteController from "../controllers/AdotanteController";

const router = Router();

router.get("/listar", AdotanteController.listarAdotantes);
router.post("/cadastrar", AdotanteController.cadastrarAdotante);

export default router;