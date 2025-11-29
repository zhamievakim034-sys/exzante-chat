import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const gemini = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

export async function generateResponse(
  systemPrompt: string,
  context: string,
  userMessage: string,
  chatHistory: { role: 'user' | 'model'; content: string }[]
): Promise<string> {
  const chat = gemini.startChat({
    history: chatHistory.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    })),
    generationConfig: {
      temperature: 0.9,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 500,
    },
  })

  const fullPrompt = `${systemPrompt}

КОНТЕКСТ ИЗ БАЗЫ ДАННЫХ (используй если релевантно):
${context}

СООБЩЕНИЕ ПОЛЬЗОВАТЕЛЯ:
${userMessage}

Отвечай как Аким. Коротко, по делу, в своём стиле.`

  const result = await chat.sendMessage(fullPrompt)
  const response = result.response
  return response.text()
}
