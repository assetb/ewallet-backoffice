export interface RedemptionRequest {
    requestId: string;
    merchantId: string;
    amount: number;
    requesterId: string;
    dateTime: string;
    status: string;
  }
  
  export interface HistoryRecord {
    type: "REDEMPTION" | "EMISSION";
    recordId: string;
    merchantId: string;
    amount: number;
    dateTime: string;
  }
  
  export interface Merchant {
    merchantId: string;
    merchantName: string;
  }
  