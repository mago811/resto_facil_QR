// src/features/admin-invoices/get-invoices.ts
import { db, facturas, sesionesPos, mesas } from '@/shared/db'
import { eq, and, gte, lte, ilike, desc, sql } from 'drizzle-orm'

export interface InvoiceFilter {
  restauranteId: string
  fechaDesde?: string
  fechaHasta?: string
  nif?: string
  page?: number
}

const PAGE_SIZE = 20

export async function getInvoices(filter: InvoiceFilter) {
  const conditions = [eq(facturas.restauranteId, filter.restauranteId)]
  if (filter.fechaDesde) conditions.push(gte(facturas.createdAt, new Date(filter.fechaDesde)))
  if (filter.fechaHasta) conditions.push(lte(facturas.createdAt, new Date(filter.fechaHasta)))
  if (filter.nif) conditions.push(ilike(facturas.documentoId, `%${filter.nif}%`))

  const page = filter.page ?? 1
  const offset = (page - 1) * PAGE_SIZE
  const whereClause = and(...conditions)

  const [countResult, invoices] = await Promise.all([
    db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(facturas)
      .where(whereClause),
    db
      .select({
        id: facturas.id,
        numeroFactura: facturas.numeroFactura,
        documentoTipo: facturas.documentoTipo,
        documentoId: facturas.documentoId,
        razonSocial: facturas.razonSocial,
        total: facturas.total,
        pdfUrl: facturas.pdfUrl,
        createdAt: facturas.createdAt,
        mesaNumero: mesas.numero,
      })
      .from(facturas)
      .leftJoin(sesionesPos, eq(facturas.sesionId, sesionesPos.id))
      .leftJoin(mesas, eq(sesionesPos.mesaId, mesas.id))
      .where(whereClause)
      .orderBy(desc(facturas.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
  ])

  const total = countResult[0]?.count ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return { invoices, total, totalPages }
}
