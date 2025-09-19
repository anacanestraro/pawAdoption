import { Router } from "express";
import * as UsuarioController from "../controllers/UsuarioController";

const router = Router();

router.get("/listarUsuarios", UsuarioController.listarUsuarios);

export default router;