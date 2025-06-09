export interface RedemptionRequest {
    requestId: string;
    merchantId: string;
    amount: number;
    requesterId: string;
    dateTime: string; // ISO
    status: string; // PENDING, etc.
  }
  
  export interface HistoryRecord {
    type: "REDEMPTION" | "EMISSION";
    recordId: string;
    merchantId: string;
    amount: number;
    dateTime: string; // ISO
  }
  