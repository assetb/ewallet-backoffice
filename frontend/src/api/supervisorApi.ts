import axios from "axios";
import { RedemptionRequest, HistoryRecord } from "../models/requestModels";

export async function fetchPendingRequests() {
  const resp = await axios.get<RedemptionRequest[]>("/api/supervisor/redemption-requests");
  return resp.data;
}

export async function fetchHistory() {
  const resp = await axios.get<HistoryRecord[]>("/api/supervisor/history");
  return resp.data;
}

export async function fetchBalance() {
  const resp = await axios.get<{ balance: number }>("/api/supervisor/balance");
  return resp.data.balance;
}

export async function confirmRedemption(requestId: string) {
  const resp = await axios.post<{ success: boolean }>("/api/supervisor/confirm-redemption", {
    requestId
  });
  return resp.data;
}
