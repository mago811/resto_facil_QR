import { NextRequest, NextResponse } from 'next/server'
import { db, empresas, restaurantes } from '@/shared/db'
import { eq, or, ilike, and } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const slug = searchParams.get('slug')
  const q = searchParams.get('q')?.trim()

  if (!slug || !q || q.length < 2) {
    return NextResponse.json([])
  }

  const [restaurante] = await db
    .select({ id: restaurantes.id })
    .from(restaurantes)
    .where(eq(restaurantes.slug, slug))
    .limit(1)

  if (!restaurante) return NextResponse.json([])

  const results = await db
    .select({
      documentoTipo: empresas.documentoTipo,
      documentoId: empresas.documentoId,
      razonSocial: empresas.razonSocial,
      direccionFacturacion: empresas.direccionFacturacion,
    })
    .from(empresas)
    .where(
      and(
        eq(empresas.restauranteId, restaurante.id),
        or(
          ilike(empresas.documentoId, `${q}%`),
          ilike(empresas.razonSocial, `%${q}%`)
        )
      )
    )
    .limit(6)

  return NextResponse.json(results)
}
