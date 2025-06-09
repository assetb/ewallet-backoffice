import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config";
import { FileService } from "../services/fileService";

interface LoginBody {
  login: string;
  password: string;
}

export async function loginHandler(req: Request<{}, {}, LoginBody>, res: Response) {
  const { login, password } = req.body;

  console.log(`→ loginHandler: входящий запрос, login="${login}", password="${password}"`);

  // Читаем всех пользователей из файла
  const lines = await FileService.getAllUsers();
  for (const line of lines) {
    const [userId, userLogin, hashedPassword, role] = line.split(";");

    console.log(`   сравниваем с записью: userLogin="${userLogin}", hashedPassword="${hashedPassword}"`);

    if (userLogin === login) {
      const match = await bcrypt.compare(password, hashedPassword);

      console.log(`   bcrypt.compare вернул: ${match}`);

      if (!match) {
        return res.status(401).json({ message: "Неверный логин или пароль" });
      }
      // Генерируем JWT
      const token = jwt.sign({ userId, role, login }, config.jwtSecret, {
        expiresIn: "2h"
      });
      return res.json({ token, user: { userId, role, login } });
    }
  }
  return res.status(401).json({ message: "Пользователь не найден" });
}

export function meHandler(req: Request, res: Response) {
  // authMiddleware уже положил req.user
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ message: "Неавторизованный" });
  }
  res.json({ user });
}
