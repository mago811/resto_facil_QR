// src/app/api/pos/facturas-pendientes/route.ts
import { db, facturas, restaurantes } from '@/shared/db'
import { eq, and, isNotNull } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const apiKey = req.nextUrl.searchParams.get('apiKey')
  if (!apiKey) return NextResponse.json({ error: 'Missing apiKey' }, { status: 401 })

  const [restaurante] = await db
    .select({ id: restaurantes.id })
    .from(restaurantes)
    .where(eq(restaurantes.posApiKey, apiKey))
    .limit(1)

  if (!restaurante) return NextResponse.json({ error: 'Invalid apiKey' }, { status: 401 })

  const pending = await db
    .select({
      id: facturas.id,
      numeroFactura: facturas.numeroFactura,
      razonSocial: facturas.razonSocial,
      documentoId: facturas.documentoId,
      baseImponible: facturas.baseImponible,
      ivaRate: facturas.ivaRate,
      cuotaIva: facturas.cuotaIva,
      total: facturas.total,
      pdfUrl: facturas.pdfUrl,
      createdAt: facturas.createdAt,
    })
    .from(facturas)
    .where(
      and(
        eq(facturas.restauranteId, restaurante.id),
        eq(facturas.impresa, false),
        isNotNull(facturas.pdfUrl)
      )
    )
    .orderBy(facturas.createdAt)

  return NextResponse.json({ facturas: pending })
}
