import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const organizationId = req.headers.get('x-organization-id')

  if (!organizationId) {
    return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
  }

  try {
    // Get active subscriptions
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        organizationId,
        status: 'ACTIVE',
      },
      include: { plan: true },
    })

    // Calculate MRR
    const mrr = activeSubscriptions.reduce((sum, sub) => {
      if (sub.plan.interval === 'MONTHLY') {
        return sum + sub.plan.price * sub.quantity
      } else if (sub.plan.interval === 'YEARLY') {
        return sum + (sub.plan.price * sub.quantity) / 12
      }
      return sum
    }, 0)

    // Calculate ARR
    const arr = mrr * 12

    // Get customer counts
    const activeCustomers = await prisma.customer.count({
      where: {
        organizationId,
        subscriptions: { some: { status: 'ACTIVE' } },
      },
    })

    // Get churn data (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const canceledSubscriptions = await prisma.subscription.count({
      where: {
        organizationId,
        status: 'CANCELED',
        canceledAt: { gte: thirtyDaysAgo },
      },
    })

    const startOfMonthCustomers = activeCustomers + canceledSubscriptions
    const churnRate =
      startOfMonthCustomers > 0
        ? (canceledSubscriptions / startOfMonthCustomers) * 100
        : 0

    // Calculate LTV (simplified: MRR / churn rate * 100)
    const ltv = churnRate > 0 ? (mrr / (churnRate / 100)) : mrr * 24

    // Get new customers this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const newCustomers = await prisma.customer.count({
      where: {
        organizationId,
        createdAt: { gte: startOfMonth },
      },
    })

    // Get total revenue this month
    const payments = await prisma.payment.findMany({
      where: {
        customer: { organizationId },
        status: 'SUCCEEDED',
        createdAt: { gte: startOfMonth },
      },
    })

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)

    // Get pending payments (dunning)
    const pendingPayments = await prisma.dunningEvent.count({
      where: {
        customer: { organizationId },
        resolved: false,
      },
    })

    // Calculate recovery rate
    const recoveredPayments = await prisma.dunningEvent.count({
      where: {
        customer: { organizationId },
        eventType: 'PAYMENT_RECOVERED',
        createdAt: { gte: thirtyDaysAgo },
      },
    })

    const totalFailedPayments = await prisma.dunningEvent.count({
      where: {
        customer: { organizationId },
        eventType: 'PAYMENT_FAILED',
        createdAt: { gte: thirtyDaysAgo },
      },
    })

    const recoveryRate =
      totalFailedPayments > 0
        ? (recoveredPayments / totalFailedPayments) * 100
        : 100

    return NextResponse.json({
      mrr,
      arr,
      activeCustomers,
      newCustomers,
      churnRate,
      churnedCustomers: canceledSubscriptions,
      ltv,
      totalRevenue,
      pendingPayments,
      recoveryRate,
      subscriptionsByPlan: activeSubscriptions.reduce(
        (acc, sub) => {
          const planName = sub.plan.name
          if (!acc[planName]) {
            acc[planName] = { count: 0, mrr: 0 }
          }
          acc[planName].count++
          acc[planName].mrr +=
            sub.plan.interval === 'MONTHLY'
              ? sub.plan.price
              : sub.plan.price / 12
          return acc
        },
        {} as Record<string, { count: number; mrr: number }>
      ),
    })
  } catch (error) {
    console.error('Revenue metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
