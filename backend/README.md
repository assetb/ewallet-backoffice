# Backend для E-Wallet Backoffice

## Настройка

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` в папке `backend/` со следующим содержимым:

```env
PORT=4000
JWT_SECRET=ваш_сложный_jwt_секрет_здесь
PAYMENT_GATEWAY_BASE_URL=https://api.nomadpay.kz/api
WALLET_BASE_URL=https://ewallet.nomadpay.kz/api
PAYMENT_GATEWAY_TOKEN=ваш_токен_платежного_шлюза
WALLET_TOKEN=ваш_токен_электронного_кошелька
```

**Важно**: 
- Замените все значения на реальные
- Убедитесь, что токены не содержат переносов строк или табуляций
- Файл `.env` не должен попадать в git (уже добавлен в .gitignore)

### 3. Запуск

#### Режим разработки
```bash
npm run dev
```

#### Продакшн
```bash
npm run build
npm start
```

## API Endpoints

### Аутентификация
- `POST /api/auth/login` - вход в систему

### Менеджер
- `GET /api/manager/uploaded-files` - список загруженных файлов
- `POST /api/manager/upload` - загрузка файла платежей

### Финансы
- `GET /api/finance/merchants` - список мерчантов
- `GET /api/finance/redemption-requests` - запросы на гашение
- `GET /api/finance/history` - история операций
- `GET /api/finance/balance` - баланс
- `POST /api/finance/redemption-requests` - создание запроса на гашение

### Супервайзер
- `GET /api/supervisor/redemption-requests` - запросы на гашение
- `GET /api/supervisor/history` - история операций
- `GET /api/supervisor/balance` - баланс
- `POST /api/supervisor/confirm-redemption` - подтверждение гашения

## Тестирование
```bash
npm test
``` 