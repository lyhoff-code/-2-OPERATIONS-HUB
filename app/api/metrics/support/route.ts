import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const organizationId = req.headers.get('x-organization-id')

  if (!organizationId) {
    return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
  }

  try {
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Open tickets
    const openTickets = await prisma.ticket.count({
      where: {
        organizationId,
        status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING'] },
      },
    })

    // Resolved today
    const resolvedToday = await prisma.ticket.count({
      where: {
        organizationId,
        status: 'RESOLVED',
        resolvedAt: { gte: startOfDay },
      },
    })

    // Urgent tickets
    const urgentTickets = await prisma.ticket.count({
      where: {
        organizationId,
        priority: 'URGENT',
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
    })

    // Average response time (for tickets with first response)
    const ticketsWithResponse = await prisma.ticket.findMany({
      where: {
        organizationId,
        firstResponseAt: { not: null },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true, firstResponseAt: true },
    })

    const avgResponseTime =
      ticketsWithResponse.length > 0
        ? ticketsWithResponse.reduce((sum, t) => {
            const diff = t.firstResponseAt!.getTime() - t.createdAt.getTime()
            return sum + diff / (1000 * 60) // Convert to minutes
          }, 0) / ticketsWithResponse.length
        : 0

    // Average resolution time
    const resolvedTickets = await prisma.ticket.findMany({
      where: {
        organizationId,
        status: 'RESOLVED',
        resolvedAt: { not: null },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true, resolvedAt: true },
    })

    const avgResolutionTime =
      resolvedTickets.length > 0
        ? resolvedTickets.reduce((sum, t) => {
            const diff = t.resolvedAt!.getTime() - t.createdAt.getTime()
            return sum + diff / (1000 * 60) // Convert to minutes
          }, 0) / resolvedTickets.length
        : 0

    // Bot resolution rate
    const totalConversations = await prisma.conversation.count({
      where: {
        customer: { organizationId },
        status: 'RESOLVED',
        createdAt: { gte: thirtyDaysAgo },
      },
    })

    const botResolvedConversations = await prisma.conversation.count({
      where: {
        customer: { organizationId },
        status: 'RESOLVED',
        resolvedByBot: true,
        createdAt: { gte: thirtyDaysAgo },
      },
    })

    const botResolutionRate =
      totalConversations > 0
        ? (botResolvedConversations / totalConversations) * 100
        : 0

    // CSAT score
    const csatTickets = await prisma.ticket.findMany({
      where: {
        organizationId,
        satisfaction: { not: null },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { satisfaction: true },
    })

    const csatScore =
      csatTickets.length > 0
        ? csatTickets.reduce((sum, t) => sum + (t.satisfaction || 0), 0) /
          csatTickets.length
        : 0

    // Tickets by category
    const ticketsByCategory = await prisma.ticket.groupBy({
      by: ['category'],
      where: {
        organizationId,
        createdAt: { gte: thirtyDaysAgo },
        category: { not: null },
      },
      _count: true,
    })

    // Tickets by priority
    const ticketsByPriority = await prisma.ticket.groupBy({
      by: ['priority'],
      where: {
        organizationId,
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
    })

    // Tickets by source
    const ticketsBySource = await prisma.ticket.groupBy({
      by: ['source'],
      where: {
        organizationId,
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
    })

    // Pending handoffs
    const pendingHandoffs = await prisma.conversation.count({
      where: {
        customer: { organizationId },
        status: 'HANDED_OFF',
      },
    })

    return NextResponse.json({
      openTickets,
      resolvedToday,
      urgentTickets,
      avgResponseTime: Math.round(avgResponseTime * 10) / 10,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      botResolutionRate: Math.round(botResolutionRate * 10) / 10,
      humanResolutionRate: Math.round((100 - botResolutionRate) * 10) / 10,
      csatScore: Math.round(csatScore * 10) / 10,
      pendingHandoffs,
      ticketsByCategory: ticketsByCategory.reduce(
        (acc, t) => {
          if (t.category) acc[t.category] = t._count
          return acc
        },
        {} as Record<string, number>
      ),
      ticketsByPriority: ticketsByPriority.reduce(
        (acc, t) => {
          acc[t.priority] = t._count
          return acc
        },
        {} as Record<string, number>
      ),
      ticketsBySource: ticketsBySource.reduce(
        (acc, t) => {
          acc[t.source] = t._count
          return acc
        },
        {} as Record<string, number>
      ),
    })
  } catch (error) {
    console.error('Support metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
