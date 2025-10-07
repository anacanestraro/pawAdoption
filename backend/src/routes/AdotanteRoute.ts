import { Router } from "express";
import * as AdotanteController from "../controllers/AdotanteController";

const router = Router();

router.get("/", AdotanteController.listarAdotantes);
router.post("/cadastrar", AdotanteController.cadastrarAdotante);
router.put("/editar/:id", AdotanteController.atualizarAdotante);

export default router;