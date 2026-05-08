'use client'
import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface QRFullscreenProps {
  mesaNumero: number
  restauranteSlug: string
  baseUrl: string
}

export function QRFullscreen({ mesaNumero, restauranteSlug, baseUrl }: QRFullscreenProps) {
  const [open, setOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const url = `${baseUrl}/factura/${restauranteSlug}/${mesaNumero}`

  useEffect(() => {
    if (open && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, { width: 280, margin: 2 }).catch(console.error)
    }
  }, [open, url])

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Mostrar QR al cliente
      </button>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
      onClick={() => setOpen(false)}
    >
      <p className="mb-6 text-lg font-semibold text-zinc-900">Mesa {mesaNumero}</p>
      <canvas ref={canvasRef} className="rounded-lg shadow-lg" />
      <p className="mt-6 text-sm text-zinc-500">Toca para cerrar</p>
    </div>
  )
}
