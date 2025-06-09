import fs from "fs/promises";
import path from "path";
import config from "../config";
import { UploadedFileRecord } from "../models/fileModels";
import { RedemptionRequest, HistoryRecord } from "../models/requestModels";

const usersFile = path.join(config.dataDir, "users.txt");
const uploadedFilesFile = path.join(config.dataDir, "uploaded_files.txt");
const merchantsFile = path.join(config.dataDir, "merchants.txt");
const redemptionRequestsFile = path.join(config.dataDir, "redemption_requests.txt");
const historyFile = path.join(config.dataDir, "history.txt");

export class FileService {
  // ======== Работа с users.txt ========
  static async getAllUsers(): Promise<string[]> {
    const content = await fs.readFile(usersFile, { encoding: "utf-8" });
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
  }

  // ======== Работа с uploaded_files.txt ========
  static async getUploadedFiles(): Promise<UploadedFileRecord[]> {
    try {
      const content = await fs.readFile(uploadedFilesFile, { encoding: "utf-8" });
      return content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => {
          const [fileName, date, uploaderId, status, uploadedCount, errorCount] =
            line.split(";");
          return {
            fileName,
            date,
            uploaderId,
            status,
            uploadedCount: parseInt(uploadedCount, 10),
            errorCount: parseInt(errorCount, 10)
          };
        });
    } catch {
      return [];
    }
  }

  static async appendUploadedFile(
    record: UploadedFileRecord
  ): Promise<void> {
    const line = [
      record.fileName,
      record.date,
      record.uploaderId,
      record.status,
      record.uploadedCount.toString(),
      record.errorCount.toString()
    ].join(";");
    await fs.appendFile(uploadedFilesFile, line + "\n", { encoding: "utf-8" });
  }

  // ======== Работа с merchants.txt ========
  static async getMerchants(): Promise<{ merchantId: string; merchantName: string }[]> {
    try {
      const content = await fs.readFile(merchantsFile, { encoding: "utf-8" });
      return content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => {
          const [merchantId, merchantName] = line.split(";");
          return { merchantId, merchantName };
        });
    } catch {
      return [];
    }
  }

  // ======== Работа с redemption_requests.txt ========
  static async getRedemptionRequests(): Promise<RedemptionRequest[]> {
    try {
      const content = await fs.readFile(redemptionRequestsFile, { encoding: "utf-8" });
      return content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => {
          const [requestId, merchantId, amount, requesterId, dateTime, status] = line.split(";");
          return {
            requestId,
            merchantId,
            amount: parseFloat(amount),
            requesterId,
            dateTime,
            status
          };
        });
    } catch {
      return [];
    }
  }

  static async addRedemptionRequest(request: RedemptionRequest): Promise<void> {
    const line = [
      request.requestId,
      request.merchantId,
      request.amount.toString(),
      request.requesterId,
      request.dateTime,
      request.status
    ].join(";");
    await fs.appendFile(redemptionRequestsFile, line + "\n", { encoding: "utf-8" });
  }

  static async removeRedemptionRequest(requestId: string): Promise<void> {
    const all = await FileService.getRedemptionRequests();
    const filtered = all.filter((r) => r.requestId !== requestId);
    const lines = filtered.map(
      (r) =>
        [
          r.requestId,
          r.merchantId,
          r.amount.toString(),
          r.requesterId,
          r.dateTime,
          r.status
        ].join(";")
    );
    await fs.writeFile(redemptionRequestsFile, lines.join("\n") + "\n", {
      encoding: "utf-8"
    });
  }

  // ======== Работа с history.txt ========
  static async getHistory(): Promise<HistoryRecord[]> {
    try {
      const content = await fs.readFile(historyFile, { encoding: "utf-8" });
      return content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => {
          const [type, recordId, merchantId, amount, dateTime] = line.split(";");
          return {
            type: type as "REDEMPTION" | "EMISSION",
            recordId,
            merchantId,
            amount: parseFloat(amount),
            dateTime
          };
        });
    } catch {
      return [];
    }
  }

  static async appendHistoryRecord(record: HistoryRecord): Promise<void> {
    const line = [
      record.type,
      record.recordId,
      record.merchantId,
      record.amount.toString(),
      record.dateTime
    ].join(";");
    await fs.appendFile(historyFile, line + "\n", { encoding: "utf-8" });
  }
}
