// src/app/api/pos/facturas/[id]/marcar-impresa/route.ts
import { db, facturas, restaurantes } from '@/shared/db'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const apiKey = req.nextUrl.searchParams.get('apiKey')
  if (!apiKey) return NextResponse.json({ error: 'Missing apiKey' }, { status: 401 })

  const [restaurante] = await db
    .select({ id: restaurantes.id })
    .from(restaurantes)
    .where(eq(restaurantes.posApiKey, apiKey))
    .limit(1)

  if (!restaurante) return NextResponse.json({ error: 'Invalid apiKey' }, { status: 401 })

  const [factura] = await db
    .select({ id: facturas.id, restauranteId: facturas.restauranteId })
    .from(facturas)
    .where(eq(facturas.id, id))
    .limit(1)

  if (!factura || factura.restauranteId !== restaurante.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.update(facturas).set({ impresa: true }).where(eq(facturas.id, id))
  return NextResponse.json({ ok: true })
}
