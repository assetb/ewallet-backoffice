import { Request, Response } from "express";
import { FileService } from "../services/fileService";
import { generateId, getCurrentISODate } from "../utils/utils";
import { PaymentGatewayService } from "../services/paymentGatewayService";

export async function getRedemptionRequestsHandler(req: Request, res: Response) {
  const requests = await FileService.getRedemptionRequests();
  res.json(requests);
}

export async function getHistoryHandler(req: Request, res: Response) {
  const history = await FileService.getHistory();
  res.json(history);
}

export async function getBalanceHandler(req: Request, res: Response) {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ message: "Неавторизованный" });
  }
  try {
    const resp = await PaymentGatewayService.getBalance(user.userId);
    return res.json({ balance: resp.balance });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Ошибка получения баланса" });
  }
}

interface ConfirmBody {
  requestId: string;
}

export async function confirmRedemptionHandler(
  req: Request<{}, {}, ConfirmBody>,
  res: Response
) {
  const { requestId } = req.body;
  const requests = await FileService.getRedemptionRequests();
  const target = requests.find((r) => r.requestId === requestId);
  if (!target) {
    return res.status(404).json({ success: false, message: "Запрос не найден" });
  }
  try {
    // Отправляем в Payment Gateway
    const pgResp = await PaymentGatewayService.redeem(
      requestId,
      target.merchantId,
      target.amount
    );
    if (pgResp.success) {
      // Удаляем из requests
      await FileService.removeRedemptionRequest(requestId);
      // Добавляем в history
      const historyRecord = {
        type: "REDEMPTION" as const,
        recordId: generateId(),
        merchantId: target.merchantId,
        amount: target.amount,
        dateTime: getCurrentISODate()
      };
      await FileService.appendHistoryRecord(historyRecord);
      return res.json({ success: true });
    } else {
      return res
        .status(400)
        .json({ success: false, message: pgResp.message ?? "Ошибка гашения" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Ошибка при гашении" });
  }
}
