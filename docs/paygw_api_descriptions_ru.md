# Jusan Emoney Redemption Service

## Описание

Сервис для создания гашения электронных денег в системе Jusan Bank. Позволяет создавать транзакции гашения с уникальным идентификатором.

## Конфигурация

1. Требуемые переменные окружения:

```env
JUSAN_EMONEY_TOKEN=your_token_here
JUSAN_EMONEY_API_URL=https://api.jusan.kz/emoney/v1

```

## Структура файлов

```plaintext
app/
├── Console/
│   └── Commands/
│       └── Jusan/
│           └── CreateEmoneyRedemption.php  # Команда для создания гашения
├── Http/
│   ├── Controllers/
│   │   └── Track/
│   │       └── QueryController.php         # Контроллер с методами getJusanEmoneyRedemption и createJusanEmoneyRedemption
│   └── Middleware/
│       └── CheckJusanEmoneyToken.php       # Middleware для проверки токена
└── Services/
    └── Jusan/
        └── EmoneyApi.php                   # API клиент для работы с Jusan
storage/
└── app/
    └── jusan_last_trans_id.txt            # Файл для хранения последнего ID транзакции
```

## API Endpoints

### Создание гашения

```http
POST /api/track/query/jusan-emoney-redemption/create
```

#### Параметры запроса

- `amount` (обязательный, integer) - сумма гашения в копейках (минимальное значение: 1)
- `jusan_token` (обязательный, string) - токен авторизации

#### Пример запроса

```json
{
    "amount": 1000,
    "jusan_token": "your_token_here"
}
```

#### Успешный ответ (200)

```json
{
    "success": true,
    "data": {
        "trans_id": "100001",
        "amount": 1000,
        "status": "success"
    }
}
```

#### Ошибка (400)

```json
{
    "success": false,
    "error": "Validation error",
    "message": "The amount field is required and must be at least 1"
}
```

#### Ошибка авторизации (401)

```json
{
    "success": false,
    "error": "Unauthorized",
    "message": "Invalid Jusan token"
}
```

#### Ошибка сервера (500)

```json
{
    "success": false,
    "error": "Server error",
    "message": "Failed to create redemption"
}
```

### Получение информации о гашении

```http
GET /api/track/query/jusan-emoney-redemption
```

#### Параметры запроса jusan-emoney-redemption

- `jusan_token` (обязательный, string) - токен авторизации

#### Успешный ответ (200) jusan-emoney-redemption

```json
{
    "success": true,
    "data": {
        "last_trans_id": "100001",
        "status": "success"
    }
}
```

## Особенности реализации

1. **Идентификаторы транзакций**:

   - Хранятся в файле `storage/app/jusan_last_trans_id.txt`
   - Начальное значение: 100000
   - Инкрементируются при каждой новой транзакции
   - Файл должен быть доступен для записи веб-серверу

2. **Авторизация**:

   - Токен передается в теле запроса как `jusan_token`
   - Проверяется middleware `CheckJusanEmoneyToken`
   - Токен должен совпадать с `JUSAN_EMONEY_TOKEN` из .env

3. **Валидация**:

   - Сумма должна быть целым числом
   - Минимальная сумма: 1 копейка
   - Токен обязателен для всех запросов

4. **Обработка ошибок**:

   - Все ошибки логируются
   - Возвращаются в формате JSON с полями success, error и message
   - HTTP коды: 200 (успех), 400 (валидация), 401 (авторизация), 500 (сервер)

5. **Логирование**:

   - Все запросы и ответы логируются
   - Ошибки логируются с детальной информацией
   - Используется стандартный логгер Laravel

## Пример использования в коде

```php
// Создание гашения
$response = Http::withHeaders([
    'Accept' => 'application/json',
    'Content-Type' => 'application/json',
])->post('https://your-domain.com/api/track/query/jusan-emoney-redemption/create', [
    'amount' => 1000,
    'jusan_token' => env('JUSAN_EMONEY_TOKEN')
]);

// Получение информации
$response = Http::withHeaders([
    'Accept' => 'application/json',
])->get('https://your-domain.com/api/track/query/jusan-emoney-redemption', [
    'jusan_token' => env('JUSAN_EMONEY_TOKEN')
]);
```

## Безопасность

### Требования к безопасности API

1. Все запросы должны быть по HTTPS

2. Токен должен храниться в .env файле

3. Рекомендуется использовать rate limiting для API endpoints

4. Рекомендуется настроить IP-фильтрацию для доступа к API

### Ограничения API и таймауты

1. Рекомендуемый интервал между запросами: не чаще 1 раза в минуту

2. Максимальное количество запросов в час: 60

3. Таймаут запроса: 30 секунд

### Примечания

1. Все суммы возвращаются в тиынах (1 тенге = 100 тиын)

2. Даты и время возвращаются в формате "Y-m-d H:i:s" в часовом поясе UTC+6

3. При отсутствии данных (например, нет эмиссий) возвращается пустой объект в соответствующем поле data

Добавлю описание этих эндпоинтов в общую документацию:

```markdown
# Jusan Emoney API Endpoints

## Получение информации об эмиссиях

```http
GET /api/track/query/jusan-emoney-emission
```

### Параметры запроса jusan-emoney-emission

- `jusan_token` (обязательный, string) - токен авторизации

### Успешный ответ (200) jusan-emoney-emission

```json
{
    "success": true,
    "data": {
        "emission": {
            "amount": 1000000,        // Сумма эмиссии в копейках
            "currency": "KZT",        // Валюта
            "status": "success",      // Статус эмиссии
            "created_at": "2024-04-22 10:00:00"  // Дата и время эмиссии
        }
    }
}
```

### Ошибка авторизации эмиссии (401)

```json
{
    "success": false,
    "error": "Unauthorized",
    "message": "Invalid Jusan token"
}
```

### Ошибка сервера эмиссии (500)

```json
{
    "success": false,
    "error": "Server error",
    "message": "Failed to get emission info"
}
```

## Получение баланса

```http
GET /api/track/query/jusan-emoney-balance
```

### Параметры запроса jusan-emoney-balance

- `jusan_token` (обязательный, string) - токен авторизации

### Успешный ответ (200) jusan-emoney-balance

```json
{
    "success": true,
    "data": {
        "balance": {
            "amount": 500000,         // Текущий баланс в копейках
            "currency": "KZT",        // Валюта
            "updated_at": "2024-04-22 10:00:00"  // Время последнего обновления
        }
    }
}
```

### Ошибка авторизации баланса (401)

```json
{
    "success": false,
    "error": "Unauthorized",
    "message": "Invalid Jusan token"
}
```

### Ошибка сервера баланса (500)

```json
{
    "success": false,
    "error": "Server error",
    "message": "Failed to get balance"
}
```

## Общие особенности эндпоинтов эмиссии и баланса

### Авторизация и безопасность

- Токен передается в теле запроса как `jusan_token`
- Проверяется middleware `CheckJusanEmoneyToken`
- Токен должен совпадать с `JUSAN_EMONEY_TOKEN` из .env

### Обработка ошибок и логирование

- Все ошибки логируются
- Возвращаются в формате JSON с полями success, error и message
- HTTP коды: 200 (успех), 401 (авторизация), 500 (сервер)

### Примеры использования API

```php
// Получение информации об эмиссиях
$response = Http::withHeaders([
    'Accept' => 'application/json',
])->get('https://your-domain.com/api/track/query/jusan-emoney-emission', [
    'jusan_token' => env('JUSAN_EMONEY_TOKEN')
]);

// Получение баланса
$response = Http::withHeaders([
    'Accept' => 'application/json',
])->get('https://your-domain.com/api/track/query/jusan-emoney-balance', [
    'jusan_token' => env('JUSAN_EMONEY_TOKEN')
]);
```
