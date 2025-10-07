import {Router} from "express";
import * as AbrigoController from "../controllers/AbrigoController";

const router = Router();

router.get("/", AbrigoController.listarAbrigos);
router.post("/cadastrar", AbrigoController.cadastrarAbrigo);

export default router;

