import { Request, Response } from "express";
import multer from "multer";
import { FileService } from "../services/fileService";
import { PaymentGatewayService } from "../services/paymentGatewayService";
import { UploadedFileRecord } from "../models/fileModels";
import { getCurrentISODate } from "../utils/utils";
import config from "../config";

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

  // Проверяем конфигурацию перед отправкой
  if (!config.paymentGateway.token) {
    console.error("ERROR: PAYMENT_GATEWAY_TOKEN не настроен");
    return res.status(500).json({ 
      success: false, 
      message: "Ошибка конфигурации: токен Payment Gateway не настроен" 
    });
  }

  if (!config.paymentGateway.baseUrl) {
    console.error("ERROR: PAYMENT_GATEWAY_BASE_URL не настроен");
    return res.status(500).json({ 
      success: false, 
      message: "Ошибка конфигурации: URL Payment Gateway не настроен" 
    });
  }

  try {
    console.log(`Начинаем загрузку файла: ${file.originalname} (${file.size} байт)`);
    
    // Прокси в Payment Gateway
    const pgResp = await PaymentGatewayService.uploadBatch(
      file.buffer,
      file.originalname
    );
    
    console.log("Ответ от Payment Gateway:", pgResp);
    
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
    console.error("Ошибка при загрузке файла:", {
      fileName: file.originalname,
      error: err.message,
      stack: err.stack,
      code: err.code
    });
    
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
    
    // Возвращаем более информативное сообщение об ошибке
    let errorMessage = "Ошибка загрузки в ПШ";
    if (err.code === 'ERR_INVALID_CHAR') {
      errorMessage = "Ошибка конфигурации: недопустимые символы в токене авторизации";
    } else if (err.code === 'ENOTFOUND') {
      errorMessage = "Ошибка подключения к Payment Gateway: сервер недоступен";
    } else if (err.code === 'ECONNREFUSED') {
      errorMessage = "Ошибка подключения к Payment Gateway: соединение отклонено";
    } else if (err.response?.status) {
      errorMessage = `Ошибка Payment Gateway: ${err.response.status} - ${err.response.statusText}`;
    }
    
    return res.status(500).json({ success: false, message: errorMessage });
  }
}
