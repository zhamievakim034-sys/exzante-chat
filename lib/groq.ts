import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function generateResponse(
  systemPrompt: string,
  context: string,
  userMessage: string,
  chatHistory: { role: 'user' | 'model'; content: string }[]
): Promise<string> {
  const fullSystemPrompt = `${systemPrompt}

КОНТЕКСТ ИЗ БАЗЫ ДАННЫХ (используй если релевантно):
${context}`

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: fullSystemPrompt },
    ...chatHistory.map((msg) => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.content,
    } as Groq.Chat.ChatCompletionMessageParam)),
    { role: 'user', content: userMessage },
  ]

  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    messages,
    temperature: 0.9,
    max_tokens: 500,
    top_p: 0.95,
  })

  return completion.choices[0]?.message?.content || 'хз что сказать'
}
