import {Router} from "express";
import * as AnimalController from "../controllers/AnimalController";
import { autenticarJWT } from "../middlewares/auth";
import { upload } from "../middlewares/upload";

const router = Router();

router.get("/", AnimalController.listarAnimais);
router.post("/cadastrar", autenticarJWT, AnimalController.cadastrarAnimal);
router.put("/editar/:id", autenticarJWT, AnimalController.atualizarAnimal);
router.delete("/deletar/:id", autenticarJWT, AnimalController.deletarAnimal);
router.post("/:id/foto", autenticarJWT, upload.single("foto"), AnimalController.uploadFotoAnimal);
export default router;