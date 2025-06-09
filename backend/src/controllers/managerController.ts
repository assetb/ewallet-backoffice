import { Request, Response } from "express";
import multer from "multer";
import { FileService } from "../services/fileService";
import { PaymentGatewayService } from "../services/paymentGatewayService";
import { UploadedFileRecord } from "../models/fileModels";
import { getCurrentISODate } from "../utils/utils";

const upload = multer({ storage: multer.memoryStorage() });

export async function getUploadedFilesHandler(req: Request, res: Response) {
  const files = await FileService.getUploadedFiles();
  res.json(files);
}

export const uploadFileMiddleware = upload.single("file");

export async function uploadFileHandler(req: Request, res: Response) {
  const file = (req as any).file as Express.Multer.File;
  const user = (req as any).user;
  if (!file || !user) {
    return res.status(400).json({ message: "Файл или пользователь отсутствует" });
  }
  try {
    // Прокси в Payment Gateway
    const pgResp = await PaymentGatewayService.uploadBatch(
      file.buffer,
      file.originalname
    );
    // Предполагаем, что возвращается { success: boolean, uploadedCount: number, errors: [] }
    const statusRecord = pgResp.success ? "SUCCESS" : "ERROR";
    const uploadedCount = pgResp.uploadedCount ?? 0;
    const errorCount = Array.isArray(pgResp.errors) ? pgResp.errors.length : 0;

    const record: UploadedFileRecord = {
      fileName: file.originalname,
      date: getCurrentISODate(),
      uploaderId: user.userId,
      status: statusRecord,
      uploadedCount,
      errorCount
    };
    await FileService.appendUploadedFile(record);
    return res.json({ success: true, detail: pgResp });
  } catch (err: any) {
    // Если что-то пошло не так
    console.error(err);
    // Записываем как ERROR
    const record: UploadedFileRecord = {
      fileName: file.originalname,
      date: getCurrentISODate(),
      uploaderId: user.userId,
      status: "ERROR",
      uploadedCount: 0,
      errorCount: 1
    };
    await FileService.appendUploadedFile(record);
    return res.status(500).json({ success: false, message: "Ошибка загрузки в ПШ" });
  }
}
