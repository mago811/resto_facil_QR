import { NextRequest, NextResponse } from 'next/server'
import { db, facturas } from '@/shared/db'
import { eq } from 'drizzle-orm'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const [factura] = await db.select({ pdfUrl: facturas.pdfUrl, numeroFactura: facturas.numeroFactura })
    .from(facturas).where(eq(facturas.id, id)).limit(1)

  if (!factura?.pdfUrl) {
    return new NextResponse('PDF no disponible', { status: 404 })
  }

  // Fetch private blob with auth token
  const res = await fetch(factura.pdfUrl, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  })

  if (!res.ok) {
    return new NextResponse('Error al obtener el PDF', { status: 502 })
  }

  const buffer = await res.arrayBuffer()
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${factura.numeroFactura}.pdf"`,
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
