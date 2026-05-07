// src/shared/lib/numero-factura.ts
import { db, restaurantes } from '@/shared/db'
import { eq, sql } from 'drizzle-orm'

export async function getNextNumeroFactura(
  tx: typeof db,
  restauranteId: string
): Promise<string> {
  const [updated] = await tx
    .update(restaurantes)
    .set({ facturaSeq: sql`${restaurantes.facturaSeq} + 1` })
    .where(eq(restaurantes.id, restauranteId))
    .returning({ seq: restaurantes.facturaSeq })

  if (!updated) throw new Error(`Restaurante ${restauranteId} not found`)
  const year = new Date().getFullYear()
  return `REST-${year}-${String(updated.seq).padStart(4, '0')}`
}
