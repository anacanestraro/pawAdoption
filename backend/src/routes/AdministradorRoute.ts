import {Router} from "express";
import * as AdministradorController from "../controllers/AdministradorController";

const router = Router();

router.get("/", AdministradorController.listarAdministradores);
router.post("/cadastrar", AdministradorController.cadastrarAdministrador);
router.put("/editar/:id", AdministradorController.atualizarAdministrador);
router.delete("/deletar/:id", AdministradorController.deletarAdministrador);

export default router;