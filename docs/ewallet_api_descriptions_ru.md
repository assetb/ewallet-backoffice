# Описание API-сервиса для обработки транзакций третьего мерчанта

## Общая информация

**Базовый URL**: `http://your-server/command`

**Аутентификация**: Все запросы должны содержать токен в теле запроса в поле `token`. Токен должен соответствовать значению `API_TOKEN` в конфигурации сервера.

## Последовательность вызовов API

### 1. Загрузка файла с транзакциями

**Запрос**:

```http
POST /command/transactions/third/upload
Content-Type: multipart/form-data

Body:
- token: string (обязательный) - токен для аутентификации
- file: file (обязательный) - Excel файл с транзакциями
```

**Ответ**:

```json
{
  "success": true,
  "message": "Файл успешно загружен",
  "data": {
    "fileId": "uuid-загруженного-файла"
  }
}
```

**Ошибки**:

- `400 Bad Request` - если файл не был загружен или имеет неверный формат
- `401 Unauthorized` - если токен неверный или отсутствует
- `500 Internal Server Error` - при внутренних ошибках сервера

**Примечание**: Файл должен быть в формате Excel (.xlsx или .xls) и содержать следующие колонки:

- Bank Reference: уникальный идентификатор транзакции
- Amount: сумма транзакции
- invoice_status: статус транзакции (должен быть "Completed")
- type: тип транзакции (должен быть "PayIn")

### 2. Запуск обработки транзакций

**Запрос**:

```http
POST /command/transactions/third/process
Content-Type: application/json

Body:
{
  "token": "string", // обязательный - токен для аутентификации
  "fileId": "uuid-загруженного-файла" // обязательный - ID файла, полученный на предыдущем шаге
}
```

**Ответ**:

```json
{
  "success": true,
  "message": "Задача запущена",
  "data": {
    "jobId": "id-задачи",
    "fileId": "uuid-загруженного-файла"
  }
}
```

**Ошибки**:

- `400 Bad Request` - если fileId не указан
- `401 Unauthorized` - если токен неверный или отсутствует
- `404 Not Found` - если файл с указанным fileId не найден
- `500 Internal Server Error` - при внутренних ошибках сервера

### 3. Проверка статуса обработки

**Запрос**:

```http
GET /command/transactions/third/status/:jobId
Content-Type: application/json

Body:
{
  "token": "string" // обязательный - токен для аутентификации
}
```

**Ответ**:

```json
{
  "success": true,
  "message": "Статус задачи получен",
  "data": {
    "id": "id-задачи",
    "state": "completed", // возможные значения: completed, failed, active, waiting, delayed
    "progress": 100, // процент выполнения (0-100)
    "result": {
      "status": "completed",
      "logs": [
        "=== Начало обработки файла...",
        "✅ Транзакция BRID-123 успешно обработана",
        "=== Обработка файла успешно завершена"
      ],
      "completedAt": "2024-03-14T12:00:00.000Z"
    }
  }
}
```

**Ошибки**:

- `401 Unauthorized` - если токен неверный или отсутствует
- `404 Not Found` - если задача с указанным jobId не найдена
- `500 Internal Server Error` - при внутренних ошибках сервера

## Пример последовательности вызовов

1. Загрузка файла:

```javascript
const formData = new FormData();
formData.append('token', 'your-api-token');
formData.append('file', excelFile);

const uploadResponse = await fetch('http://your-server/command/transactions/third/upload', {
  method: 'POST',
  body: formData
});

const { data: { fileId } } = await uploadResponse.json();
```

1. Запуск обработки:

```javascript
const processResponse = await fetch('http://your-server/command/transactions/third/process', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'your-api-token',
    fileId: fileId
  })
});

const { data: { jobId } } = await processResponse.json();
```

1. Проверка статуса (можно делать периодически):

```javascript
const statusResponse = await fetch(`http://your-server/command/transactions/third/status/${jobId}`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    token: 'your-api-token'
  })
});

const { data: status } = await statusResponse.json();

if (status.state === 'completed') {
  console.log('Обработка завершена успешно');
  console.log('Логи:', status.result.logs);
} else if (status.state === 'failed') {
  console.error('Обработка завершилась с ошибкой');
  console.error('Ошибка:', status.result.error);
} else {
  console.log(`Обработка в процессе: ${status.progress}%`);
}
```

## Особенности реализации

1. Обработка файла происходит асинхронно в фоновом режиме
2. Все логи обработки сохраняются и доступны через API
3. Статус обработки можно отслеживать через API
4. Файлы хранятся на сервере в директории, указанной в `UPLOAD_DIR`
5. Для работы сервиса требуется Redis (для очереди задач)

## Требования к серверу

1. Redis должен быть установлен и запущен
2. Переменные окружения:
   - `API_TOKEN` - токен для аутентификации
   - `UPLOAD_DIR` - директория для хранения загруженных файлов
   - `REDIS_HOST` - хост Redis (по умолчанию localhost)
   - `REDIS_PORT` - порт Redis (по умолчанию 6379)

## Обработка ошибок

Все ошибки возвращаются в формате:

```json
{
  "success": false,
  "message": "Описание ошибки",
  "code": 1,
  "statusCode": 400
}
```

Где:

- `success` - всегда false для ошибок
- `message` - человекочитаемое описание ошибки
- `code` - внутренний код ошибки
- `statusCode` - HTTP статус код
