const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

export async function sendMessage(chatId: number, text: string) {
  // Разбиваем длинные сообщения (как Аким - короткими кусками)
  const messages = splitMessage(text)
  
  for (const msg of messages) {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: msg,
      }),
    })
    
    // Небольшая задержка между сообщениями для реалистичности
    if (messages.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
    }
  }
}

export async function sendTyping(chatId: number) {
  await fetch(`${TELEGRAM_API}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      action: 'typing',
    }),
  })
}

// Разбивает сообщение на короткие куски (как Аким пишет)
function splitMessage(text: string): string[] {
  // Если сообщение короткое - не разбиваем
  if (text.length < 60) return [text]
  
  // Разбиваем по предложениям или переносам строк
  const parts = text.split(/(?<=[.!?\n])\s+/)
  const messages: string[] = []
  let current = ''
  
  for (const part of parts) {
    if (current.length + part.length > 80) {
      if (current) messages.push(current.trim())
      current = part
    } else {
      current += (current ? ' ' : '') + part
    }
  }
  
  if (current) messages.push(current.trim())
  
  return messages.length > 0 ? messages : [text]
}

export async function setWebhook(url: string) {
  const response = await fetch(`${TELEGRAM_API}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  return response.json()
}
