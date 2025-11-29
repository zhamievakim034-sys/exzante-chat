import { NextRequest, NextResponse } from 'next/server'
import { setWebhook } from '@/lib/telegram'

export async function GET(request: NextRequest) {
  const webhookUrl = process.env.WEBHOOK_URL
  
  if (!webhookUrl || webhookUrl === 'https://your-domain.vercel.app') {
    return NextResponse.json({ 
      error: 'WEBHOOK_URL not configured',
      message: 'Update WEBHOOK_URL in .env.local with your Vercel domain'
    }, { status: 400 })
  }

  const fullWebhookUrl = `${webhookUrl}/api/telegram`
  
  try {
    const result = await setWebhook(fullWebhookUrl)
    return NextResponse.json({ 
      success: true,
      webhook_url: fullWebhookUrl,
      telegram_response: result 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to set webhook',
      details: String(error)
    }, { status: 500 })
  }
}
