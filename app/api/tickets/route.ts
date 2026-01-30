import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateTicketNumber } from '@/lib/utils'
import { sendEmail, getTicketCreatedEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  const organizationId = req.headers.get('x-organization-id')
  const status = req.nextUrl.searchParams.get('status')
  const priority = req.nextUrl.searchParams.get('priority')
  const category = req.nextUrl.searchParams.get('category')

  if (!organizationId) {
    return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
  }

  const where: Record<string, unknown> = { organizationId }

  if (status && status !== 'all') {
    where.status = status
  }

  if (priority && priority !== 'all') {
    where.priority = priority
  }

  if (category && category !== 'all') {
    where.category = category
  }

  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      customer: { select: { name: true, email: true } },
      assignedTo: { select: { name: true, email: true } },
      comments: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' },
    ],
  })

  return NextResponse.json(tickets)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      organizationId,
      customerId,
      subject,
      description,
      priority = 'MEDIUM',
      category,
      source = 'WEB_FORM',
    } = body

    if (!organizationId || !subject || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const ticketNumber = generateTicketNumber()

    const ticket = await prisma.ticket.create({
      data: {
        organizationId,
        customerId: customerId || null,
        ticketNumber,
        subject,
        description,
        status: 'OPEN',
        priority,
        category,
        source,
      },
      include: {
        customer: { select: { name: true, email: true } },
      },
    })

    // Send confirmation email if customer has email
    if (ticket.customer?.email) {
      const email = getTicketCreatedEmail({
        customerName: ticket.customer.name || 'Customer',
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        viewTicketUrl: `${process.env.NEXT_PUBLIC_APP_URL}/tickets/${ticket.id}`,
      })

      await sendEmail({
        to: ticket.customer.email,
        subject: email.subject,
        html: email.html,
      })
    }

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error('Create ticket error:', error)
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { ticketId, status, priority, assignedToId, category } = body

    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}

    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId
    if (category) updateData.category = category

    // Track resolution time
    if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date()
    }

    // Track first response time
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    })

    if (ticket && !ticket.firstResponseAt && (status === 'IN_PROGRESS' || assignedToId)) {
      updateData.firstResponseAt = new Date()
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        customer: { select: { name: true, email: true } },
        assignedTo: { select: { name: true, email: true } },
      },
    })

    return NextResponse.json(updatedTicket)
  } catch (error) {
    console.error('Update ticket error:', error)
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    )
  }
}
