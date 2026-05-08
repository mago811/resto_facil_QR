// src/app/api/facturas/csv/route.ts
import { auth } from '@/auth'
import { exportFacturasCSV } from '@/features/admin-invoices/export-csv'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const csv = await exportFacturasCSV(session.user.restauranteId)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="facturas.csv"',
    },
  })
}
