// src/app/api/pdf/[id]/route.ts
import { db, facturas } from '@/shared/db'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let factura: { pdfUrl: string | null; restauranteId: string } | undefined
  try {
    ;[factura] = await db
      .select({ pdfUrl: facturas.pdfUrl, restauranteId: facturas.restauranteId })
      .from(facturas)
      .where(eq(facturas.id, id))
  } catch {
    return NextResponse.json({ error: 'PDF not found' }, { status: 404 })
  }
  if (!factura?.pdfUrl) return NextResponse.json({ error: 'PDF not found' }, { status: 404 })

  const session = await auth()
  if (!session || session.user.restauranteId !== factura.restauranteId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.redirect(factura.pdfUrl)
}
