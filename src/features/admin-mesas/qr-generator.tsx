// src/features/admin-mesas/qr-generator.tsx
'use client'
import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Button } from '@/shared/ui/button'

interface QRGeneratorProps {
  mesaNumero: number
  restauranteSlug: string
  baseUrl: string
}

export function QRGenerator({ mesaNumero, restauranteSlug, baseUrl }: QRGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const url = `${baseUrl}/factura/${restauranteSlug}/${mesaNumero}`

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, { width: 200 }).catch(console.error)
    }
  }, [url])

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `qr-mesa-${mesaNumero}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} />
      <p className="text-xs text-zinc-500 break-all">{url}</p>
      <Button variant="secondary" onClick={download}>Descargar PNG</Button>
    </div>
  )
}
