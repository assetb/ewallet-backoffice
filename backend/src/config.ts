import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Проверяем, что все необходимые переменные есть
const requiredEnv = [
  "PORT",
  "JWT_SECRET",
  "PAYMENT_GATEWAY_BASE_URL",
  "WALLET_BASE_URL",
  "PAYMENT_GATEWAY_TOKEN",
  "WALLET_TOKEN"
];

for (const varName of requiredEnv) {
  if (!process.env[varName]) {
    console.error(`ERROR: Не найдена переменная окружения ${varName}`);
    process.exit(1);
  }
}

export default {
  port: parseInt(process.env.PORT as string, 10),
  jwtSecret: process.env.JWT_SECRET as string,
  paymentGateway: {
    baseUrl: process.env.PAYMENT_GATEWAY_BASE_URL as string,
    token: process.env.PAYMENT_GATEWAY_TOKEN as string
  },
  wallet: {
    baseUrl: process.env.WALLET_BASE_URL as string,
    token: process.env.WALLET_TOKEN as string
  },
  dataDir: path.resolve(__dirname, "../data")
};
