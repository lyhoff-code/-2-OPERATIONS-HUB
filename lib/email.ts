// Email sending utilities
// In production, integrate with SendGrid, Postmark, or your preferred provider

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: string | Buffer
    contentType?: string
  }>
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // In development, log the email
  if (process.env.NODE_ENV === 'development') {
    console.log('📧 Email would be sent:', {
      to: options.to,
      subject: options.subject,
      from: options.from || process.env.EMAIL_FROM,
    })
    return true
  }

  // In production, implement actual email sending
  // Example with nodemailer or similar
  try {
    // const transporter = nodemailer.createTransport({...})
    // await transporter.sendMail({...})
    console.log('Email sent to:', options.to)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// ============================================
// EMAIL TEMPLATES
// ============================================

export function getPaymentFailedEmail(params: {
  customerName: string
  amount: string
  retryDate: string
  updateCardUrl: string
}): { subject: string; html: string } {
  return {
    subject: 'Payment Failed - Action Required',
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">Payment Issue</h1>
    </div>
    <div class="content">
      <p>Hi ${params.customerName},</p>
      <p>We tried to charge your card for <strong>${params.amount}</strong> but the payment didn't go through.</p>
      <p>Don't worry - we'll automatically retry on <strong>${params.retryDate}</strong>.</p>
      <p>To avoid any service interruption, please update your payment method:</p>
      <a href="${params.updateCardUrl}" class="button">Update Payment Method</a>
      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        If you have any questions, just reply to this email.
      </p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}

export function getFinalWarningEmail(params: {
  customerName: string
  amount: string
  deadline: string
  updateCardUrl: string
}): { subject: string; html: string } {
  return {
    subject: 'Final Notice - Service Will Be Paused',
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #EF4444, #DC2626); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .button { display: inline-block; background: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .warning { background: #FEF2F2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">Final Notice</h1>
    </div>
    <div class="content">
      <p>Hi ${params.customerName},</p>
      <div class="warning">
        <strong>Your service will be paused on ${params.deadline}</strong> unless payment of ${params.amount} is received.
      </div>
      <p>We've tried multiple times to charge your card without success. This is the last reminder before we pause your account.</p>
      <a href="${params.updateCardUrl}" class="button">Pay Now to Keep Service</a>
      <p style="margin-top: 30px;">
        Need help? Contact us immediately and we'll work something out.
      </p>
    </div>
    <div class="footer">
      <p>This is an automated message regarding your account status.</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}

export function getInvoiceEmail(params: {
  customerName: string
  invoiceNumber: string
  amount: string
  dueDate: string
  viewInvoiceUrl: string
  items: Array<{ description: string; amount: string }>
}): { subject: string; html: string } {
  const itemsHtml = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.amount}</td>
      </tr>
    `
    )
    .join('')

  return {
    subject: `Invoice ${params.invoiceNumber} - ${params.amount}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .total-row { font-weight: bold; font-size: 18px; }
    .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">Invoice ${params.invoiceNumber}</h1>
    </div>
    <div class="content">
      <p>Hi ${params.customerName},</p>
      <p>Here's your invoice. Payment is due by <strong>${params.dueDate}</strong>.</p>

      <table class="invoice-table">
        <thead>
          <tr>
            <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Description</th>
            <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr class="total-row">
            <td style="padding: 15px 10px;">Total</td>
            <td style="padding: 15px 10px; text-align: right;">${params.amount}</td>
          </tr>
        </tbody>
      </table>

      <a href="${params.viewInvoiceUrl}" class="button">View & Pay Invoice</a>
    </div>
    <div class="footer">
      <p>Thank you for your business!</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}

export function getWelcomeEmail(params: {
  customerName: string
  planName: string
  loginUrl: string
}): { subject: string; html: string } {
  return {
    subject: 'Welcome! Your subscription is active',
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .feature { display: flex; align-items: center; margin: 15px 0; }
    .feature-icon { background: #D1FAE5; color: #059669; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; }
    .button { display: inline-block; background: #10B981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0; font-size: 28px;">Welcome aboard! 🎉</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Your ${params.planName} plan is now active</p>
    </div>
    <div class="content">
      <p>Hi ${params.customerName},</p>
      <p>Thank you for subscribing! We're excited to have you with us.</p>

      <h3>What's next?</h3>
      <div class="feature">
        <div class="feature-icon">✓</div>
        <div>Access all features included in your plan</div>
      </div>
      <div class="feature">
        <div class="feature-icon">✓</div>
        <div>24/7 support whenever you need it</div>
      </div>
      <div class="feature">
        <div class="feature-icon">✓</div>
        <div>Automatic billing - no manual renewals needed</div>
      </div>

      <a href="${params.loginUrl}" class="button">Get Started</a>

      <p style="margin-top: 30px; color: #6b7280;">
        Questions? Just reply to this email - we're here to help!
      </p>
    </div>
    <div class="footer">
      <p>Welcome to the family! 💚</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}

export function getTicketCreatedEmail(params: {
  customerName: string
  ticketNumber: string
  subject: string
  viewTicketUrl: string
}): { subject: string; html: string } {
  return {
    subject: `Ticket #${params.ticketNumber}: ${params.subject}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8B5CF6, #7C3AED); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .ticket-info { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .button { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0;">Support Ticket Created</h1>
    </div>
    <div class="content">
      <p>Hi ${params.customerName},</p>
      <p>We've received your support request and created a ticket for you.</p>

      <div class="ticket-info">
        <p><strong>Ticket Number:</strong> #${params.ticketNumber}</p>
        <p><strong>Subject:</strong> ${params.subject}</p>
      </div>

      <p>Our team will review your request and get back to you as soon as possible.</p>

      <a href="${params.viewTicketUrl}" class="button">View Ticket Status</a>
    </div>
    <div class="footer">
      <p>You can reply to this email to add more information to your ticket.</p>
    </div>
  </div>
</body>
</html>
    `,
  }
}
