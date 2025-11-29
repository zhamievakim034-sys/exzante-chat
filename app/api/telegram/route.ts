import { NextRequest, NextResponse } from 'next/server'
import { sendMessage, sendTyping } from '@/lib/telegram'
import { generateResponse } from '@/lib/groq'
import { getContext, saveMessage } from '@/lib/rag'
import { SYSTEM_PROMPT } from '@/lib/system-prompt'

interface TelegramUpdate {
  message?: {
    message_id: number
    from: {
      id: number
      first_name: string
      username?: string
    }
    chat: {
      id: number
      type: string
    }
    text?: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json()
    
    // Игнорируем если нет сообщения или текста
    if (!update.message?.text) {
      return NextResponse.json({ ok: true })
    }

    const chatId = update.message.chat.id
    const userId = update.message.from.id.toString()
    const userMessage = update.message.text
    const userName = update.message.from.first_name

    // Показываем что печатаем
    await sendTyping(chatId)

    // Сохраняем сообщение пользователя
    await saveMessage(userId, 'user', userMessage)

    // Получаем контекст из базы данных
    const context = await getContext(userId, userMessage)

    // Формируем контекст для LLM
    const contextString = `
ЧЕРТЫ ЛИЧНОСТИ:
${context.personality}

ЭМОЦИОНАЛЬНЫЕ ТРИГГЕРЫ:
${context.triggers}

ВОСПОМИНАНИЯ:
${context.memories}

НЕДАВНИЕ СООБЩЕНИЯ В ЭТОМ ЧАТЕ:
${context.recentMessages}

ИНФОРМАЦИЯ О СОБЕСЕДНИКЕ:
Имя: ${userName}
`.trim()

    // Генерируем ответ
    const response = await generateResponse(
      SYSTEM_PROMPT,
      contextString,
      userMessage,
      [] // история чата уже в контексте
    )

    // Сохраняем ответ бота
    await saveMessage(userId, 'clone', response)

    // Отправляем ответ (функция сама разобьёт на части если нужно)
    await sendMessage(chatId, response)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}

// Для проверки что endpoint работает
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    bot: 'EXZANTE CHAT',
    message: 'Webhook is ready' 
  })
}
