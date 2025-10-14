import {Router} from "express";
import * as AnimalController from "../controllers/AnimalController";

const router = Router();

router.get("/", AnimalController.listarAnimais);

export default router;