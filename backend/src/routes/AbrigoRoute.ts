import {Router} from "express";
import * as AbrigoController from "../controllers/AbrigoController";

const router = Router();

router.get("/", AbrigoController.listarAbrigos);
router.post("/cadastrar", AbrigoController.cadastrarAbrigo);
router.put("/editar/:id", AbrigoController.atualizarAbrigo);
router.delete("/deletar/:id", AbrigoController.deletarAbrigo);


export default router;

