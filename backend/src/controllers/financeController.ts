import { Request, Response } from "express";
import { FileService } from "../services/fileService";
import { generateId, getCurrentISODate } from "../utils/utils";
import { PaymentGatewayService } from "../services/paymentGatewayService";

export async function getMerchantsHandler(req: Request, res: Response) {
  const merchants = await FileService.getMerchants();
  res.json(merchants);
}

export async function getRedemptionRequestsHandler(req: Request, res: Response) {
  const requests = await FileService.getRedemptionRequests();
  res.json(requests);
}

export async function getHistoryHandler(req: Request, res: Response) {
  const history = await FileService.getHistory();
  // Разбиваем на два массива (гашения и эмиссии) если нужно, но фронт может фильтровать
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

interface NewRedemptionBody {
  merchantId: string;
  amount: number;
}

export async function createRedemptionRequestHandler(
  req: Request<{}, {}, NewRedemptionBody>,
  res: Response
) {
  const body = req.body;
  const user = (req as any).user;
  if (!body.merchantId || !body.amount || !user) {
    return res.status(400).json({ message: "Неверные данные" });
  }
  const requestId = generateId();
  const record = {
    requestId,
    merchantId: body.merchantId,
    amount: body.amount,
    requesterId: user.userId,
    dateTime: getCurrentISODate(),
    status: "PENDING"
  };
  try {
    await FileService.addRedemptionRequest(record);
    return res.json({ success: true, requestId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Ошибка сохранения запроса" });
  }
}
