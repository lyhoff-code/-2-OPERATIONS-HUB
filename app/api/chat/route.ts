import { NextRequest, NextResponse } from 'next/server'
import { detectIntent, generateSupportResponse, searchKnowledgeBase } from '@/lib/openai'
import { prisma } from '@/lib/db'
import { generateTicketNumber } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, sessionId, customerId, organizationId } = body

    if (!message || !sessionId || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get or create conversation
    let conversation = await prisma.conversation.findFirst({
      where: { sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          customerId: customerId || '',
          sessionId,
          status: 'ACTIVE',
        },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      })
    }

    // Save user message
    await prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: message,
      },
    })

    // Detect intent and sentiment
    const intentResult = await detectIntent(message)

    // Check if human handoff is needed
    if (intentResult.requiresHuman || intentResult.urgency === 'high') {
      // Update conversation status
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { status: 'HANDED_OFF', handedOffAt: new Date() },
      })

      // Create ticket
      const ticket = await prisma.ticket.create({
        data: {
          organizationId,
          customerId: customerId || null,
          ticketNumber: generateTicketNumber(),
          subject: `Chat handoff: ${intentResult.intent}`,
          description: message,
          status: 'OPEN',
          priority: intentResult.urgency === 'high' ? 'URGENT' : 'HIGH',
          source: 'CHAT',
        },
      })

      // Update conversation with ticket
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { ticketId: ticket.id },
      })

      const handoffMessage =
        intentResult.sentiment === 'negative'
          ? "I understand you're frustrated, and I want to make sure you get the help you need. I'm connecting you with a human support agent right now. They'll be with you shortly."
          : "I'll connect you with a human support agent who can help you better. Please wait a moment."

      // Save bot response
      await prisma.conversationMessage.create({
        data: {
          conversationId: conversation.id,
          role: 'BOT',
          content: handoffMessage,
          intent: intentResult.intent,
          confidence: intentResult.confidence,
        },
      })

      return NextResponse.json({
        response: handoffMessage,
        handoff: true,
        ticketNumber: ticket.ticketNumber,
        intent: intentResult.intent,
        sentiment: intentResult.sentiment,
      })
    }

    // Search knowledge base for relevant articles
    const articles = await prisma.article.findMany({
      where: {
        organizationId,
        status: 'PUBLISHED',
      },
      select: { title: true, content: true, category: true },
    })

    const relevantArticles = await searchKnowledgeBase(
      message,
      articles.map((a) => ({
        title: a.title,
        content: a.content,
        category: a.category,
      }))
    )

    // Get customer context if available
    let customerContext = ''
    if (customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          subscriptions: { where: { status: 'ACTIVE' }, include: { plan: true } },
        },
      })
      if (customer) {
        customerContext = `Customer: ${customer.name}, Plan: ${
          customer.subscriptions[0]?.plan?.name || 'None'
        }`
      }
    }

    // Build conversation history
    const previousMessages = conversation.messages.slice(-10).map((m) => ({
      role: m.role.toLowerCase() as 'user' | 'assistant',
      content: m.content,
    }))

    // Generate response
    const response = await generateSupportResponse({
      message,
      intent: intentResult.intent,
      context: customerContext,
      knowledgeBase: relevantArticles.map((a) => `${a.title}:\n${a.content}`),
      previousMessages,
    })

    // Save bot response
    await prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'BOT',
        content: response,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
      },
    })

    // Update article view counts
    for (const article of relevantArticles) {
      await prisma.article.updateMany({
        where: { title: article.title, organizationId },
        data: { viewCount: { increment: 1 } },
      })
    }

    return NextResponse.json({
      response,
      handoff: false,
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      sentiment: intentResult.sentiment,
      suggestedArticles: relevantArticles.map((a) => a.title),
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId')

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
  }

  const conversation = await prisma.conversation.findFirst({
    where: { sessionId },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })

  if (!conversation) {
    return NextResponse.json({ messages: [] })
  }

  return NextResponse.json({
    status: conversation.status,
    messages: conversation.messages.map((m) => ({
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
  })
}
