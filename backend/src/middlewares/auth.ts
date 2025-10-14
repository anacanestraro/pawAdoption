import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'senha-secreta';

// extrair o usuário logado do jwt
export interface AuthRequest<T = any> extends Request {
  usuario?: {
    id: number;
    tipo_usuario: 'ADOTANTE' | 'ABRIGO' | 'ADMINISTRADOR';
  };
  body: T;
}

export function autenticarJWT(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      tipo_usuario: 'ADOTANTE' | 'ABRIGO' | 'ADMINISTRADOR';
    };

    req.usuario = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}