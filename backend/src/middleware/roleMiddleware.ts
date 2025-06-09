import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

export function roleMiddleware(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Неавторизованный" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Доступ запрещён" });
    }
    next();
  };
}
