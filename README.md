# EXZANTE CHAT

Цифровой двойник Акима — Telegram бот на Next.js + Supabase + Gemini.

## Установка

1. Установи зависимости:
```bash
npm install
```

2. Проверь `.env.local` — там должны быть все ключи

3. Запусти локально для теста:
```bash
npm run dev
```

## Деплой на Vercel

1. Создай репозиторий на GitHub и запуши код:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/exzante-chat.git
git push -u origin main
```

2. Зайди на [vercel.com](https://vercel.com) и импортируй проект

3. Добавь Environment Variables в Vercel:
   - `TELEGRAM_BOT_TOKEN`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `WEBHOOK_URL` — твой домен Vercel (например `https://exzante-chat.vercel.app`)

4. После деплоя открой в браузере:
```
https://твой-домен.vercel.app/api/set-webhook
```

Это установит webhook для Telegram бота.

5. Готово! Напиши боту в Telegram.

## Структура

```
app/
├── api/
│   ├── telegram/route.ts    # Webhook для Telegram
│   └── set-webhook/route.ts # Установка webhook
├── page.tsx                 # Главная страница
├── layout.tsx
└── globals.css

lib/
├── supabase.ts              # Клиент Supabase
├── gemini.ts                # Клиент Gemini
├── telegram.ts              # Функции для Telegram
├── rag.ts                   # RAG - поиск по базе
└── system-prompt.ts         # System prompt (личность Акима)
```

## Как это работает

1. Пользователь пишет в Telegram
2. Telegram отправляет сообщение на webhook
3. Бот получает контекст из Supabase (черты личности, триггеры, воспоминания, историю чата)
4. Формирует промпт и отправляет в Gemini
5. Ответ разбивается на короткие сообщения (как пишет Аким)
6. Отправляется в Telegram
