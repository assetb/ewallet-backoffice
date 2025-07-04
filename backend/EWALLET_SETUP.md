# Настройка Ewallet API

## Описание изменений

Обработка файлов была переделана для использования Ewallet API вместо Payment Gateway API. Теперь процесс включает три последовательных вызова:

1. **Загрузка файла** - `POST /command/transactions/third/upload`
2. **Запуск обработки** - `POST /command/transactions/third/process`
3. **Проверка статуса** - `POST /command/transactions/third/status/:jobId`

## Необходимые переменные окружения

Добавьте в файл `.env` следующие переменные:

```env
# Ewallet API для обработки транзакций третьего мерчанта
EWALLET_BASE_URL=http://your-server/command
EWALLET_TOKEN=ваш_токен_ewallet
```

Где:
- `EWALLET_BASE_URL` - базовый URL ewallet сервиса
- `EWALLET_TOKEN` - токен для аутентификации в ewallet API

## Структура файлов

### Новые файлы:
- `src/services/ewalletService.ts` - сервис для работы с ewallet API

### Измененные файлы:
- `src/controllers/managerController.ts` - обновлен для использования ewallet API
- `src/config.ts` - добавлены переменные для ewallet

## Логирование

Добавлено подробное логирование с эмодзи для лучшей читаемости:

- 🚀 - начало процесса
- 🔄 - выполнение шага
- 📤 - отправка запроса
- ✅ - успешное выполнение
- ❌ - ошибка
- 💾 - сохранение в базу данных
- 💥 - критическая ошибка
- 📝 - возврат ошибки пользователю

## Обработка ошибок

Улучшена обработка ошибок с детальными сообщениями для различных типов ошибок:

- Ошибки конфигурации
- Ошибки сети
- HTTP ошибки (400, 401, 404, 500)
- Ошибки таймаута

## Формат ответа

Фронтенд теперь получает более детальную информацию:

```json
{
  "success": true,
  "detail": {
    "state": "completed",
    "progress": 100,
    "logs": ["=== Начало обработки файла...", "✅ Транзакция BRID-123 успешно обработана"],
    "completedAt": "2024-03-14T12:00:00.000Z",
    "uploadedCount": 1,
    "errorCount": 0
  }
}
```

## Требования к файлам

Файлы должны быть в формате Excel (.xlsx или .xls) и содержать следующие колонки:

- Bank Reference: уникальный идентификатор транзакции
- Amount: сумма транзакции
- invoice_status: статус транзакции (должен быть "Completed")
- type: тип транзакции (должен быть "PayIn")

## Тестирование

Для тестирования убедитесь, что:

1. Все переменные окружения настроены
2. Ewallet сервис доступен
3. Токен действителен
4. Redis запущен (требуется для ewallet сервиса) 