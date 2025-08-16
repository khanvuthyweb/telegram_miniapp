// app/api/verify/route.ts
import { NextResponse } from 'next/server'
import crypto from 'crypto'

function verifyInitData(initData: string, botToken: string) {
  // initData is a query string like "auth_date=...&query_id=...&user=...&hash=..."
  const decoded = decodeURIComponent(initData || '')
  const params = new URLSearchParams(decoded)

  const hash = params.get('hash')
  if (!hash) return false

  // collect entries excluding 'hash'
  const entries: Array<[string, string]> = []
  for (const [k, v] of params) {
    if (k === 'hash') continue
    entries.push([k, v])
  }
  entries.sort((a, b) => a[0].localeCompare(b[0]))
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n')

  // secret = HMAC_SHA256(key="WebAppData", message=botToken)
  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
  const computed = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex')

  // Timing-safe compare:
  const equal = crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(hash, 'hex'))
  return equal
}

export async function POST(req: Request) {
  const { initData } = await req.json()
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
  if (!BOT_TOKEN) return NextResponse.json({ ok: false, error: 'no bot token' }, { status: 500 })

  const ok = verifyInitData(initData, BOT_TOKEN)
  // Optional: check auth_date for freshness (prevent replay)
  return NextResponse.json({ ok })
}
