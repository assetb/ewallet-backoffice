# E-Wallet Backoffice

Веб-приложение для управления электронными платежами с интеграцией Payment Gateway и Electronic Wallet.

## Быстрый старт

### 1. Настройка Backend

```bash
cd backend
npm install
```

Создайте файл `.env` в папке `backend/`:

```env
PORT=4000
JWT_SECRET=ваш_сложный_jwt_секрет_здесь
PAYMENT_GATEWAY_BASE_URL=https://api.nomadpay.kz/api
PAYMENT_GATEWAY_TOKEN=ваш_токен_платежного_шлюза
EWALLET_BASE_URL=https://ewallet.nomadpay.kz/api
EWALLET_TOKEN=ваш_токен_электронного_кошелька
```

### 2. Настройка Frontend

```bash
cd frontend
npm install
```

### 3. Запуск

#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
cd frontend
npm start
```

Приложение будет доступно по адресу: http://localhost:3000

## Роли пользователей

- **Manager**: загрузка файлов платежей
- **Finance**: создание запросов на гашение, просмотр истории
- **Supervisor**: подтверждение запросов на гашение

## Тестовые учетные данные

Создайте файл `backend/data/users.txt`:

```
1;admin;password123;manager
2;finance;password123;finance
3;supervisor;password123;supervisor
```

## Документация

Подробная документация находится в папке `docs/`:
- [Техническое задание (RU)](docs/technical_specification_ru.md)
- [API описания](docs/paygw_api_descriptions_ru.md)
