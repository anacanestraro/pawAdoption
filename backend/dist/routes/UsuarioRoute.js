import { Router } from "express";
import * as UsuarioController from "../controllers/UsuarioController.js";
const router = Router();
router.get("/listarUsuarios", UsuarioController.listarUsuarios);
export default router;
//# sourceMappingURL=UsuarioRoute.js.map