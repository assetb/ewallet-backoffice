export interface UserRecord {
    userId: string;
    login: string;
    hashedPassword: string;
    role: "manager" | "finance" | "supervisor";
  }
  