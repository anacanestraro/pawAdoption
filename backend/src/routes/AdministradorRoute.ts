import {Router} from "express";
import * as AdministradorController from "../controllers/AdministradorController";

const router = Router();

router.get("/", AdministradorController.listarAdministradores);
router.post("/cadastrar", AdministradorController.cadastrarAdministrador);

export default router;