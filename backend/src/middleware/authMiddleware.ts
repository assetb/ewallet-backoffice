import { Request, Response, NextFunction } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import config from "../config";

export interface AuthRequest extends Request {
  user?: { userId: string; role: string; login: string };
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Необходима авторизация" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret) as {
      userId: string;
      role: string;
      login: string;
    };
    req.user = { userId: payload.userId, role: payload.role, login: payload.login };
    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return res.status(401).json({ message: "Срок действия токена истек" });
    }
    if (err instanceof JsonWebTokenError) {
      return res.status(401).json({ message: "Неверный формат токена" });
    }
    return res.status(401).json({ message: "Ошибка авторизации" });
  }
}
