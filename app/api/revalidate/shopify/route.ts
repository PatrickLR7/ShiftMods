import { createHmac } from 'crypto'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const hash = createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64')
  return hash === signature
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET

  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const signature = req.headers.get('x-shopify-hmac-sha256')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
  }

  const rawBody = await req.text()

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  revalidateTag('shopify', 'max');

  return NextResponse.json({ revalidated: true, now: Date.now() })
}
