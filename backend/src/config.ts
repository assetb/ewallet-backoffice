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
  "WALLET_TOKEN",
  "EWALLET_BASE_URL",
  "EWALLET_TOKEN"
];

for (const varName of requiredEnv) {
  if (!process.env[varName]) {
    console.error(`ERROR: Не найдена переменная окружения ${varName}`);
    console.error("Убедитесь, что файл .env существует в папке backend/ и содержит все необходимые переменные");
    console.error("Пример содержимого .env файла:");
    console.error("PORT=4000");
    console.error("JWT_SECRET=ваш_сложный_jwt_секрет");
    console.error("PAYMENT_GATEWAY_BASE_URL=https://api.nomadpay.kz/api");
    console.error("WALLET_BASE_URL=https://ewallet.nomadpay.kz/api");
    console.error("PAYMENT_GATEWAY_TOKEN=ваш_токен_ПШ");
    console.error("WALLET_TOKEN=ваш_токен_ЭК");
    console.error("EWALLET_BASE_URL=http://your-server/command");
    console.error("EWALLET_TOKEN=ваш_токен_ewallet");
    process.exit(1);
  }
}

export default {
  port: parseInt(process.env.PORT as string, 10),
  jwtSecret: process.env.JWT_SECRET as string,
  paymentGateway: {
    baseUrl: process.env.PAYMENT_GATEWAY_BASE_URL as string,
    token: (process.env.PAYMENT_GATEWAY_TOKEN as string).trim()
  },
  wallet: {
    baseUrl: process.env.WALLET_BASE_URL as string,
    token: (process.env.WALLET_TOKEN as string).trim()
  },
  ewallet: {
    baseUrl: process.env.EWALLET_BASE_URL as string,
    token: (process.env.EWALLET_TOKEN as string).trim()
  },
  dataDir: path.resolve(__dirname, "../data")
};
