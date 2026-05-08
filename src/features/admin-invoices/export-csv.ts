// src/features/admin-invoices/export-csv.ts
'use server'
import { db, facturas } from '@/shared/db'
import { eq } from 'drizzle-orm'

function sanitizeCsvField(value: string): string {
  // Prefix-strip formula injection chars
  if (/^[=+@\-]/.test(value)) return "'" + value
  return value
}

export async function exportFacturasCSV(restauranteId: string): Promise<string> {
  const rows = await db.select().from(facturas).where(eq(facturas.restauranteId, restauranteId))

  const headers = ['Numero Factura', 'Fecha', 'Tipo Doc', 'Documento', 'Razon Social', 'Direccion', 'Base Imponible', 'IVA Rate', 'Cuota IVA', 'Total']
  const csvRows = rows.map(f => [
    sanitizeCsvField(f.numeroFactura),
    f.createdAt.toISOString().split('T')[0] ?? '',
    sanitizeCsvField(f.documentoTipo),
    sanitizeCsvField(f.documentoId),
    sanitizeCsvField(f.razonSocial),
    sanitizeCsvField(f.direccionFacturacion),
    f.baseImponible,
    f.ivaRate,
    f.cuotaIva,
    f.total,
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))

  return [headers.join(','), ...csvRows].join('\n')
}
