import axios from "axios";
import FormData from "form-data";
import config from "../config";

// Проверяем токен при инициализации
if (!config.ewallet.token) {
  console.error("ERROR: EWALLET_TOKEN не установлен в переменных окружения");
  process.exit(1);
}

// Проверяем, что токен не содержит недопустимых символов
const token = config.ewallet.token.trim();
if (token.includes('\n') || token.includes('\r') || token.includes('\t')) {
  console.error("ERROR: EWALLET_TOKEN содержит недопустимые символы (переносы строк, табуляции)");
  process.exit(1);
}

const ewalletClient = axios.create({
  baseURL: config.ewallet.baseUrl,
  timeout: 30000 // Увеличиваем timeout для обработки файлов
});

export interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    fileId: string;
  };
}

export interface ProcessResponse {
  success: boolean;
  message: string;
  data: {
    jobId: string;
    fileId: string;
  };
}

export interface StatusResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    state: 'completed' | 'failed' | 'active' | 'waiting' | 'delayed';
    progress: number;
    result: {
      status: string;
      logs: string[];
      completedAt?: string;
      error?: string;
    };
  };
}

export class EwalletService {
  /**
   * Шаг 1: Загрузка файла с транзакциями
   * @param fileBuffer - буфер файла
   * @param originalName - оригинальное имя файла
   * @returns ответ с fileId
   */
  static async uploadTransactionsFile(fileBuffer: Buffer, originalName: string): Promise<UploadResponse> {
    console.log(`🔄 [EWALLET] Начинаем загрузку файла: ${originalName} (${fileBuffer.length} байт)`);
    
    const form = new FormData();
    form.append("token", token);
    form.append("file", fileBuffer, { filename: originalName });
    
    const headers = {
      ...form.getHeaders()
    };
    
    console.log(`📤 [EWALLET] Отправляем запрос на загрузку файла:`, {
      url: `${config.ewallet.baseUrl}/command/transactions/third/upload`,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 10) + "...",
      fileName: originalName,
      fileSize: fileBuffer.length
    });
    
    try {
      const response = await axios.post(
        `${config.ewallet.baseUrl}/command/transactions/third/upload`,
        form,
        { headers }
      );
      
      console.log(`✅ [EWALLET] Файл успешно загружен:`, {
        fileId: response.data.data?.fileId,
        message: response.data.message
      });
      
      return response.data;
    } catch (error: any) {
      console.error(`❌ [EWALLET] Ошибка при загрузке файла:`, {
        fileName: originalName,
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Шаг 2: Запуск обработки транзакций
   * @param fileId - ID файла, полученный на предыдущем шаге
   * @returns ответ с jobId
   */
  static async processTransactions(fileId: string): Promise<ProcessResponse> {
    console.log(`🔄 [EWALLET] Запускаем обработку транзакций для файла: ${fileId}`);
    
    const requestBody = {
      token: token,
      fileId: fileId
    };
    
    console.log(`📤 [EWALLET] Отправляем запрос на обработку:`, {
      url: `${config.ewallet.baseUrl}/command/transactions/third/process`,
      fileId: fileId,
      tokenLength: token.length
    });
    
    try {
      const response = await ewalletClient.post(
        "/command/transactions/third/process",
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`✅ [EWALLET] Обработка запущена:`, {
        jobId: response.data.data?.jobId,
        fileId: response.data.data?.fileId,
        message: response.data.message
      });
      
      return response.data;
    } catch (error: any) {
      console.error(`❌ [EWALLET] Ошибка при запуске обработки:`, {
        fileId: fileId,
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Шаг 3: Проверка статуса обработки
   * @param jobId - ID задачи, полученный на предыдущем шаге
   * @returns статус обработки
   */
  static async checkProcessingStatus(jobId: string): Promise<StatusResponse> {
    console.log(`🔄 [EWALLET] Проверяем статус обработки для задачи: ${jobId}`);
    
    const requestBody = {
      token: token
    };
    
    console.log(`📤 [EWALLET] Отправляем запрос на проверку статуса:`, {
      url: `${config.ewallet.baseUrl}/command/transactions/third/status/${jobId}`,
      jobId: jobId,
      tokenLength: token.length
    });
    
    try {
      // Используем POST вместо GET, так как GET с телом запроса может не поддерживаться
      const response = await axios.post(
        `${config.ewallet.baseUrl}/command/transactions/third/status/${jobId}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log(`✅ [EWALLET] Статус получен:`, {
        jobId: jobId,
        state: response.data.data?.state,
        progress: response.data.data?.progress,
        message: response.data.message
      });
      
      return response.data;
    } catch (error: any) {
      console.error(`❌ [EWALLET] Ошибка при проверке статуса:`, {
        jobId: jobId,
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Полная последовательность обработки файла
   * @param fileBuffer - буфер файла
   * @param originalName - оригинальное имя файла
   * @returns финальный статус обработки
   */
  static async processFileComplete(fileBuffer: Buffer, originalName: string): Promise<StatusResponse> {
    console.log(`🚀 [EWALLET] Начинаем полную обработку файла: ${originalName}`);
    
    try {
      // Шаг 1: Загрузка файла
      const uploadResponse = await this.uploadTransactionsFile(fileBuffer, originalName);
      const fileId = uploadResponse.data.fileId;
      
      // Шаг 2: Запуск обработки
      const processResponse = await this.processTransactions(fileId);
      const jobId = processResponse.data.jobId;
      
      // Шаг 3: Проверка статуса
      const statusResponse = await this.checkProcessingStatus(jobId);
      
      console.log(`🎉 [EWALLET] Полная обработка завершена:`, {
        fileName: originalName,
        fileId: fileId,
        jobId: jobId,
        finalState: statusResponse.data.state,
        progress: statusResponse.data.progress
      });
      
      return statusResponse;
    } catch (error: any) {
      console.error(`💥 [EWALLET] Ошибка в полной обработке файла:`, {
        fileName: originalName,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
} 