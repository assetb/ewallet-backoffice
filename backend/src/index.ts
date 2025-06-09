import express from "express";
import cors from "cors";
import path from "path";
import config from "./config";
import authRoutes from "./routes/authRoutes";
import managerRoutes from "./routes/managerRoutes";
import financeRoutes from "./routes/financeRoutes";
import supervisorRoutes from "./routes/supervisorRoutes";
import { errorMiddleware } from "./middleware/errorMiddleware";

async function ensureDataFilesExist() {
  const fs = await import("fs/promises");
  const dataDir = path.resolve(__dirname, "../data");
  // Если папки data нет — создаём
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }

  // Создаём пустые файлы, если их нет
  const files = [
    "users.txt",
    "uploaded_files.txt",
    "merchants.txt",
    "redemption_requests.txt",
    "history.txt"
  ];
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    try {
      await fs.access(filePath);
    } catch {
      // Создаём пустой файл
      await fs.writeFile(filePath, "", { encoding: "utf-8" });
    }
  }
}

async function startServer() {
  await ensureDataFilesExist();

  const app = express();

  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
  
  app.use(cors());
  app.use(express.json());

  // Роуты
  app.use("/api/auth", authRoutes);
  app.use("/api/manager", managerRoutes);
  app.use("/api/finance", financeRoutes);
  app.use("/api/supervisor", supervisorRoutes);

  // Обработка ошибок
  app.use(errorMiddleware);

  app.listen(config.port, () => {
    console.log(`Backend ФП запущен на http://localhost:${config.port}`);
  });
}

startServer().catch((err) => {
  console.error("Ошибка при запуске сервера:", err);
});
