import { Router } from "express";
import * as DenunciaController from "../controllers/DenunciaController";
import { autenticarJWT } from "../middlewares/auth";

const router = Router();

router.get("/", DenunciaController.listarDenuncias);