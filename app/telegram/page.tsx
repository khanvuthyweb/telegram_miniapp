'use client'
import { useEffect, useState } from 'react'

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp
    }
  }

  interface TelegramWebApp {
    initData: string
    ready: () => void
    sendData: (data: string) => void
    MainButton?: unknown
  }
}

export default function TelegramMiniAppPage() {
  const [status, setStatus] = useState('waiting')

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) {
      setStatus('Telegram WebApp not found (open inside Telegram)')
      return
    }
    try {
      tg.ready()
      const initData = tg.initData

      fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      })
        .then((r) => r.json())
        .then((json) => {
          if (json.ok) {
            setStatus('validated ✅')
          } else {
            setStatus('invalid initData ❌')
          }
        })
        .catch((e: unknown) => {
          if (e instanceof Error) {
            setStatus('verify error: ' + e.message)
          } else {
            setStatus('verify error: unknown')
          }
        })
    } catch (e: unknown) {
      if (e instanceof Error) {
        setStatus('error: ' + e.message)
      } else {
        setStatus('error: unknown')
      }
    }
  }, [])

  const sendToBot = () => {
    const tg = window.Telegram?.WebApp
    if (!tg) return
    tg.sendData(
      JSON.stringify({ action: 'hello_from_mini_app', ts: Date.now() })
    )
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Telegram Mini App (Next.js)</h1>
      <p>Status: {status}</p>
      <button onClick={sendToBot}>Send data to bot (tg.sendData)</button>
    </main>
  )
}
