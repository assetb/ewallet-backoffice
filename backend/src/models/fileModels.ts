export interface UploadedFileRecord {
    fileName: string;
    date: string; // ISO
    uploaderId: string;
    status: string; // e.g. SUCCESS or ERROR
    uploadedCount: number;
    errorCount: number;
  }
  