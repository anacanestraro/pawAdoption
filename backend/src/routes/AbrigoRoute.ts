import {Router} from "express";
import * as AbrigoController from "../controllers/AbrigoController";

const router = Router();

router.get("/", AbrigoController.listarAbrigos);

export default router;

