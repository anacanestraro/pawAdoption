import multer from "multer";
import path from "path";
import fs from "fs";

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
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Formato inválido. Apenas .jpg, .jpeg e .png são permitidos."));
        }
        cb(null, true);
    },
});