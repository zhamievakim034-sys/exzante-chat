import { supabase } from './supabase'

export interface Context {
  personality: string
  triggers: string
  memories: string
  recentMessages: string
}

// Получаем черты личности
async function getPersonalityTraits(): Promise<string> {
  const { data, error } = await supabase
    .from('personality_traits')
    .select('trait_category, trait_name, description, examples, intensity')
    .order('intensity', { ascending: false })
    .limit(10)

  if (error || !data) return ''

  return data
    .map((t) => `[${t.trait_category}] ${t.trait_name} (${t.intensity}/10): ${t.description}${t.examples?.length ? ` Примеры: ${t.examples.join(', ')}` : ''}`)
    .join('\n')
}

// Получаем эмоциональные триггеры
async function getEmotionalTriggers(): Promise<string> {
  const { data, error } = await supabase
    .from('emotional_triggers')
    .select('trigger_type, trigger_topic, emotional_response, typical_phrases')
    .limit(10)

  if (error || !data) return ''

  return data
    .map((t) => `[${t.trigger_type}] ${t.trigger_topic}: ${t.emotional_response}${t.typical_phrases?.length ? ` Фразы: ${t.typical_phrases.join(', ')}` : ''}`)
    .join('\n')
}

// Получаем общие воспоминания (поиск по ключевым словам)
async function getRelevantMemories(query: string): Promise<string> {
  const keywords = query.toLowerCase().split(' ').filter(w => w.length > 3)
  
  const { data, error } = await supabase
    .from('shared_memories')
    .select('memory_type, title, description, emotions, importance')
    .order('importance', { ascending: false })
    .limit(5)

  if (error || !data) return ''

  return data
    .map((m) => `[${m.memory_type}] ${m.title}: ${m.description}`)
    .join('\n')
}

// Получаем последние сообщения из чата
async function getRecentMessages(userId: string, limit: number = 10): Promise<string> {
  const { data, error } = await supabase
    .from('chat_logs')
    .select('role, content, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error || !data) return ''

  return data
    .reverse()
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n')
}

// Сохраняем сообщение в базу
export async function saveMessage(
  userId: string,
  role: 'user' | 'clone',
  content: string
) {
  // Сначала получаем или создаём сессию
  let sessionId: string | null = null
  
  const { data: existingSession } = await supabase
    .from('conversation_sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()

  if (existingSession) {
    sessionId = existingSession.id
  } else {
    // Проверяем есть ли user_context
    const { data: userContext } = await supabase
      .from('user_context')
      .select('user_id')
      .eq('user_id', userId)
      .single()

    if (!userContext) {
      // Создаём user_context
      await supabase.from('user_context').insert({
        user_id: userId,
        display_name: 'User',
      })
    }

    // Создаём новую сессию
    const { data: newSession } = await supabase
      .from('conversation_sessions')
      .insert({
        user_id: userId,
        is_active: true,
      })
      .select('id')
      .single()

    sessionId = newSession?.id || null
  }

  // Сохраняем сообщение
  await supabase.from('chat_logs').insert({
    session_id: sessionId,
    user_id: userId,
    role,
    content,
  })
}

// Получаем полный контекст для генерации ответа
export async function getContext(userId: string, userMessage: string): Promise<Context> {
  const [personality, triggers, memories, recentMessages] = await Promise.all([
    getPersonalityTraits(),
    getEmotionalTriggers(),
    getRelevantMemories(userMessage),
    getRecentMessages(userId),
  ])

  return {
    personality,
    triggers,
    memories,
    recentMessages,
  }
}
