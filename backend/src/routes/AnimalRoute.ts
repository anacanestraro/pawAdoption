import {Router} from "express";
import * as AnimalController from "../controllers/AnimalController";
import { autenticarJWT } from "../middlewares/auth";

const router = Router();

router.get("/", AnimalController.listarAnimais);
router.post("/cadastrar", autenticarJWT, AnimalController.cadastrarAnimal);

export default router;