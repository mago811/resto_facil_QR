'use client'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already installed (running in standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!deferredPrompt || dismissed) return null

  async function install() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setDeferredPrompt(null)
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-xl bg-zinc-900 border border-zinc-700 p-4 shadow-xl flex items-center gap-4 lg:left-auto lg:right-6 lg:w-80">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm">Instalar Resto Fácil QR</p>
        <p className="text-xs text-zinc-400 mt-0.5">Acceso rápido desde la pantalla de inicio</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => setDismissed(true)}
          className="rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          No
        </button>
        <button
          onClick={install}
          className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition-colors"
        >
          Instalar
        </button>
      </div>
    </div>
  )
}
