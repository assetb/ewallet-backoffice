import { Request, Response } from "express";
import multer from "multer";
import { FileService } from "../services/fileService";
import { EwalletService } from "../services/ewalletService";
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

  // Проверяем конфигурацию ewallet перед отправкой
  if (!config.ewallet.token) {
    console.error("ERROR: EWALLET_TOKEN не настроен");
    return res.status(500).json({ 
      success: false, 
      message: "Ошибка конфигурации: токен Ewallet не настроен" 
    });
  }

  if (!config.ewallet.baseUrl) {
    console.error("ERROR: EWALLET_BASE_URL не настроен");
    return res.status(500).json({ 
      success: false, 
      message: "Ошибка конфигурации: URL Ewallet не настроен" 
    });
  }

  try {
    console.log(`🚀 [MANAGER] Начинаем обработку файла: ${file.originalname} (${file.size} байт) от пользователя ${user.userId}`);
    
    // Выполняем полную последовательность обработки через Ewallet API
    const ewalletResponse = await EwalletService.processFileComplete(
      file.buffer,
      file.originalname
    );
    
    console.log(`✅ [MANAGER] Обработка через Ewallet завершена:`, {
      fileName: file.originalname,
      state: ewalletResponse.data.state,
      progress: ewalletResponse.data.progress,
      logsCount: ewalletResponse.data.result.logs?.length || 0
    });
    
    // Определяем статус для записи в базу данных
    let statusRecord: string;
    let uploadedCount = 0;
    let errorCount = 0;
    
    if (ewalletResponse.data.state === 'completed') {
      statusRecord = "SUCCESS";
      // Подсчитываем успешные транзакции из логов
      const successLogs = ewalletResponse.data.result.logs?.filter(log => 
        log.includes('✅') && log.includes('успешно обработана')
      ) || [];
      uploadedCount = successLogs.length;
      
      // Подсчитываем ошибки из логов
      const errorLogs = ewalletResponse.data.result.logs?.filter(log => 
        log.includes('❌') || log.includes('ошибка')
      ) || [];
      errorCount = errorLogs.length;
      
    } else if (ewalletResponse.data.state === 'failed') {
      statusRecord = "ERROR";
      errorCount = 1;
    } else {
      statusRecord = "PROCESSING";
    }

    // Записываем результат в базу данных
    const record: UploadedFileRecord = {
      fileName: file.originalname,
      date: getCurrentISODate(),
      uploaderId: user.userId,
      status: statusRecord,
      uploadedCount,
      errorCount
    };
    
    await FileService.appendUploadedFile(record);
    
    console.log(`💾 [MANAGER] Результат сохранен в базу данных:`, {
      fileName: file.originalname,
      status: statusRecord,
      uploadedCount,
      errorCount
    });
    
    // Возвращаем результат фронтенду
    return res.json({ 
      success: true, 
      detail: {
        state: ewalletResponse.data.state,
        progress: ewalletResponse.data.progress,
        logs: ewalletResponse.data.result.logs,
        completedAt: ewalletResponse.data.result.completedAt,
        uploadedCount,
        errorCount
      }
    });
    
  } catch (err: any) {
    console.error(`💥 [MANAGER] Ошибка при обработке файла:`, {
      fileName: file.originalname,
      userId: user.userId,
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
    
    // Формируем информативное сообщение об ошибке
    let errorMessage = "Ошибка обработки в Ewallet";
    
    if (err.code === 'ERR_INVALID_CHAR') {
      errorMessage = "Ошибка конфигурации: недопустимые символы в токене авторизации";
    } else if (err.code === 'ENOTFOUND') {
      errorMessage = "Ошибка подключения к Ewallet: сервер недоступен";
    } else if (err.code === 'ECONNREFUSED') {
      errorMessage = "Ошибка подключения к Ewallet: соединение отклонено";
    } else if (err.code === 'ETIMEDOUT') {
      errorMessage = "Ошибка подключения к Ewallet: превышено время ожидания";
    } else if (err.response?.status) {
      const status = err.response.status;
      if (status === 400) {
        errorMessage = "Ошибка Ewallet: неверный формат файла или данных";
      } else if (status === 401) {
        errorMessage = "Ошибка Ewallet: неверный токен авторизации";
      } else if (status === 404) {
        errorMessage = "Ошибка Ewallet: ресурс не найден";
      } else if (status === 500) {
        errorMessage = "Ошибка Ewallet: внутренняя ошибка сервера";
      } else {
        errorMessage = `Ошибка Ewallet: ${status} - ${err.response.statusText}`;
      }
    } else if (err.message) {
      errorMessage = `Ошибка Ewallet: ${err.message}`;
    }
    
    console.error(`📝 [MANAGER] Возвращаем ошибку пользователю:`, {
      fileName: file.originalname,
      errorMessage
    });
    
    return res.status(500).json({ 
      success: false, 
      message: errorMessage,
      detail: {
        error: err.message,
        code: err.code,
        status: err.response?.status
      }
    });
  }
}
