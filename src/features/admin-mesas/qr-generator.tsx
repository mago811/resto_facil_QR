// src/features/admin-mesas/qr-generator.tsx
'use client'
import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

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

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} />
    </div>
  )
}
