import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

// ============================================
// INTENT DETECTION
// ============================================

const SUPPORT_INTENTS = [
  'password_reset',
  'billing_question',
  'refund_request',
  'technical_issue',
  'feature_request',
  'general_inquiry',
  'account_access',
  'subscription_change',
  'cancellation',
  'complaint',
  'praise',
  'unknown',
] as const

export type SupportIntent = (typeof SUPPORT_INTENTS)[number]

interface IntentDetectionResult {
  intent: SupportIntent
  confidence: number
  entities: Record<string, string>
  sentiment: 'positive' | 'neutral' | 'negative'
  urgency: 'low' | 'medium' | 'high'
  requiresHuman: boolean
}

export async function detectIntent(
  message: string
): Promise<IntentDetectionResult> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are a customer support intent classifier. Analyze the user message and return a JSON object with:
- intent: one of ${SUPPORT_INTENTS.join(', ')}
- confidence: 0-1 score
- entities: extracted entities like email, order_id, product_name, etc.
- sentiment: positive, neutral, or negative
- urgency: low, medium, or high (based on tone, words like "urgent", "immediately", etc.)
- requiresHuman: boolean (true if complex issue, frustration detected, or explicit request for human)

Return only valid JSON, no markdown.`,
      },
      {
        role: 'user',
        content: message,
      },
    ],
    temperature: 0.3,
    max_tokens: 500,
  })

  const content = response.choices[0]?.message?.content || '{}'

  try {
    return JSON.parse(content) as IntentDetectionResult
  } catch {
    return {
      intent: 'unknown',
      confidence: 0,
      entities: {},
      sentiment: 'neutral',
      urgency: 'medium',
      requiresHuman: true,
    }
  }
}

// ============================================
// RESPONSE GENERATION
// ============================================

interface GenerateResponseParams {
  message: string
  intent: SupportIntent
  customerName?: string
  context?: string
  knowledgeBase?: string[]
  previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>
  language?: 'en' | 'es'
}

export async function generateSupportResponse(
  params: GenerateResponseParams
): Promise<string> {
  const {
    message,
    intent,
    customerName,
    context,
    knowledgeBase,
    previousMessages = [],
    language = 'en',
  } = params

  const systemPrompt = language === 'es'
    ? `Eres un asistente de soporte al cliente amigable y profesional. Tu nombre es "Asistente de Soporte".
${customerName ? `El cliente se llama ${customerName}.` : ''}
${context ? `Contexto adicional: ${context}` : ''}
${knowledgeBase?.length ? `Artículos relevantes de la base de conocimiento:\n${knowledgeBase.join('\n\n')}` : ''}

Directrices:
- Sé conciso pero útil
- Usa un tono profesional pero amigable
- Si no puedes resolver el problema, ofrece conectar con un humano
- No inventes información que no tengas
- Si el usuario parece frustrado, muestra empatía primero`
    : `You are a friendly and professional customer support assistant. Your name is "Support Assistant".
${customerName ? `The customer's name is ${customerName}.` : ''}
${context ? `Additional context: ${context}` : ''}
${knowledgeBase?.length ? `Relevant knowledge base articles:\n${knowledgeBase.join('\n\n')}` : ''}

Guidelines:
- Be concise but helpful
- Use a professional yet friendly tone
- If you cannot resolve the issue, offer to connect with a human
- Do not make up information you don't have
- If the user seems frustrated, show empathy first`

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...previousMessages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: message },
  ]

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    temperature: 0.7,
    max_tokens: 1000,
  })

  return response.choices[0]?.message?.content ||
    (language === 'es'
      ? 'Lo siento, no pude procesar tu mensaje. ¿Puedo ayudarte con algo más?'
      : 'I apologize, I could not process your message. Can I help you with something else?')
}

// ============================================
// KNOWLEDGE BASE SEARCH
// ============================================

export async function searchKnowledgeBase(
  query: string,
  articles: Array<{ title: string; content: string; category: string }>
): Promise<Array<{ title: string; content: string; relevance: number }>> {
  if (!articles.length) return []

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are a search assistant. Given a user query and a list of articles, rank the articles by relevance to the query.
Return a JSON array of objects with: { "index": number, "relevance": 0-1 }
Only include articles with relevance > 0.3. Sort by relevance descending. Return only valid JSON array.`,
      },
      {
        role: 'user',
        content: `Query: "${query}"

Articles:
${articles.map((a, i) => `[${i}] ${a.title}: ${a.content.slice(0, 200)}...`).join('\n\n')}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 500,
  })

  const content = response.choices[0]?.message?.content || '[]'

  try {
    const rankings = JSON.parse(content) as Array<{ index: number; relevance: number }>
    return rankings
      .filter((r) => r.relevance > 0.3)
      .slice(0, 3)
      .map((r) => ({
        title: articles[r.index].title,
        content: articles[r.index].content,
        relevance: r.relevance,
      }))
  } catch {
    return []
  }
}

// ============================================
// CHURN PREDICTION
// ============================================

interface ChurnPredictionInput {
  daysSinceLastLogin: number
  supportTicketsLast30Days: number
  paymentFailuresLast90Days: number
  usageDeclinePercentage: number
  subscriptionAgeMonths: number
  planTier: string
}

export async function predictChurnRisk(
  input: ChurnPredictionInput
): Promise<{ risk: number; factors: string[] }> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are a churn prediction model. Analyze customer data and predict churn risk.
Return JSON: { "risk": 0-1, "factors": ["reason1", "reason2"] }
Risk levels: 0-0.3 low, 0.3-0.6 medium, 0.6-1.0 high
Consider factors like engagement, payment history, support issues, plan tier.`,
      },
      {
        role: 'user',
        content: JSON.stringify(input),
      },
    ],
    temperature: 0.3,
    max_tokens: 300,
  })

  const content = response.choices[0]?.message?.content || '{"risk": 0.5, "factors": []}'

  try {
    return JSON.parse(content)
  } catch {
    return { risk: 0.5, factors: ['Unable to analyze'] }
  }
}
