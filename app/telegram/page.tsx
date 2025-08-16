'use client'
import { useEffect, useState } from 'react'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        initData: string;
        sendData: (data: string) => void;
        MainButton?: unknown;
      };
    };
  }
}

export default function TelegramMiniAppPage() {
  const [status, setStatus] = useState('waiting')

  useEffect(() => {
    // run only in browser
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      setStatus('Telegram WebApp not found (open inside Telegram)')
      return
    }
    try {
      tg.ready()
      const initData = tg.initData // string (query string)
      // Send to your server for validation
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
        .catch((e) => setStatus('verify error: ' + (e as Error).message))
    } catch (e) {
      setStatus('error: ' + (e as Error).message)
    }
  }, [])

  const sendToBot = async () => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    // send data to the bot as a service message, length <= 4096 bytes
    tg.sendData(JSON.stringify({ action: 'hello_from_mini_app', ts: Date.now() }))
    // or use tg.MainButton etc.
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Telegram Mini App (Next.js)</h1>
      <p>Status: {status}</p>
      <button onClick={sendToBot}>Send data to bot (tg.sendData)</button>
    </main>
  ) 
}