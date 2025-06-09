import axios from "axios";
import { RedemptionRequest, HistoryRecord } from "../models/requestModels";

export interface Merchant {
  merchantId: string;
  merchantName: string;
}

export async function fetchMerchants() {
  const resp = await axios.get<Merchant[]>("/api/finance/merchants");
  return resp.data;
}

export async function fetchRedemptionRequests() {
  const resp = await axios.get<RedemptionRequest[]>("/api/finance/redemption-requests");
  return resp.data;
}

export async function fetchHistory() {
  const resp = await axios.get<HistoryRecord[]>("/api/finance/history");
  return resp.data;
}

export async function fetchBalance() {
  const resp = await axios.get<{ balance: number }>("/api/finance/balance");
  return resp.data.balance;
}

export async function createRedemptionRequest(merchantId: string, amount: number) {
  const resp = await axios.post<{ success: boolean; requestId: string }>(
    "/api/finance/redemption-requests",
    { merchantId, amount }
  );
  return resp.data;
}
