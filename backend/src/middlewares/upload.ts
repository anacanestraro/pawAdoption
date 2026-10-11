import multer from "multer";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";

// Limites das fotos de animais (RN08: de 1 a 5 fotos)
export const MAX_FOTOS_ANIMAL = 5;
const TAMANHO_MAXIMO_MB = 5;

// Garante que a pasta existe antes de o multer tentar salvar
const uploadDir = path.join(__dirname, "../uploads/animais");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

export const upload = multer({
    storage,
    limits: {
        fileSize: TAMANHO_MAXIMO_MB * 1024 * 1024,
        files: MAX_FOTOS_ANIMAL,
    },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Formato inválido. Apenas JPG, PNG e WEBP são permitidos."));
        }
        cb(null, true);
    },
});

// Recebe até 5 arquivos no campo "fotos" e transforma os erros do multer
// em respostas 400 com JSON (sem isso o Express devolve um 500 em HTML).
export const uploadFotos = (req: Request, res: Response, next: NextFunction) => {
    upload.array("fotos", MAX_FOTOS_ANIMAL)(req, res, (err: unknown) => {
        if (!err) return next();

        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({ error: `Cada foto pode ter no máximo ${TAMANHO_MAXIMO_MB}MB.` });
            }
            if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
                return res.status(400).json({ error: `Envie no máximo ${MAX_FOTOS_ANIMAL} fotos.` });
            }
            return res.status(400).json({ error: "Erro no envio das fotos." });
        }

        const mensagem = err instanceof Error ? err.message : "Erro no envio das fotos.";
        return res.status(400).json({ error: mensagem });
    });
};