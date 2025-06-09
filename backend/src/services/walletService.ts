import axios from "axios";
import config from "../config";

const walletClient = axios.create({
  baseURL: config.wallet.baseUrl,
  headers: {
    Authorization: `Bearer ${config.wallet.token}`
  },
  timeout: 10000
});

export class WalletService {
  static async getPayments(userId: string) {
    const resp = await walletClient.get(`/wallet/payments?userId=${userId}`);
    return resp.data;
  }

  // Здесь можно добавить другие методы взаимодействия с ЭК
}
