import axios from "axios";
import FormData from "form-data";
import config from "../config";

// Проверяем токен при инициализации
if (!config.paymentGateway.token) {
  console.error("ERROR: PAYMENT_GATEWAY_TOKEN не установлен в переменных окружения");
  process.exit(1);
}

// Проверяем, что токен не содержит недопустимых символов
const token = config.paymentGateway.token.trim();
if (token.includes('\n') || token.includes('\r') || token.includes('\t')) {
  console.error("ERROR: PAYMENT_GATEWAY_TOKEN содержит недопустимые символы (переносы строк, табуляции)");
  process.exit(1);
}

const pgClient = axios.create({
  baseURL: config.paymentGateway.baseUrl,
  headers: {
    Authorization: `Bearer ${token}`
  },
  timeout: 10000
});

export class PaymentGatewayService {
  static async uploadBatch(fileBuffer: Buffer, originalName: string) {
    const form = new FormData();
    form.append("file", fileBuffer, { filename: originalName });
    const headers = {
      ...form.getHeaders(),
      Authorization: `Bearer ${token}`
    };
    
    console.log("Отправляем запрос к Payment Gateway:", {
      url: `${config.paymentGateway.baseUrl}/payments/batch-upload`,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 10) + "..."
    });
    
    const resp = await axios.post(
      `${config.paymentGateway.baseUrl}/payments/batch-upload`,
      form,
      { headers }
    );
    return resp.data;
  }

  static async getMerchants() {
    const resp = await pgClient.get("/merchants");
    return resp.data;
  }

  static async getBalance(userId: string) {
    const resp = await pgClient.get(`/balance?userId=${userId}`);
    return resp.data;
  }

  static async redeem(requestId: string, merchantId: string, amount: number) {
    const resp = await pgClient.post("/payments/redeem", {
      requestId,
      merchantId,
      amount
    });
    return resp.data;
  }
}
