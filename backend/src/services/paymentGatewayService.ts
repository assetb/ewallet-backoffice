import axios from "axios";
import FormData from "form-data";
import config from "../config";

const pgClient = axios.create({
  baseURL: config.paymentGateway.baseUrl,
  headers: {
    Authorization: `Bearer ${config.paymentGateway.token}`
  },
  timeout: 10000
});

export class PaymentGatewayService {
  static async uploadBatch(fileBuffer: Buffer, originalName: string) {
    const form = new FormData();
    form.append("file", fileBuffer, { filename: originalName });
    const headers = {
      ...form.getHeaders(),
      Authorization: `Bearer ${config.paymentGateway.token}`
    };
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
