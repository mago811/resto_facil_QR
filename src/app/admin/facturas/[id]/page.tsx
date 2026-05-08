// src/app/(admin)/facturas/[id]/page.tsx
import { auth } from '@/auth'
import { db, facturas, restaurantes } from '@/shared/db'
import { eq } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import { regeneratePdf } from '@/features/invoice-emit/actions'

interface PageProps { params: Promise<{ id: string }> }

export default async function FacturaDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.restauranteId) redirect('/login')
  const restauranteId = session.user.restauranteId
  const [factura] = await db.select().from(facturas).where(eq(facturas.id, id))
  if (!factura || factura.restauranteId !== restauranteId) notFound()
  const [restaurante] = await db.select().from(restaurantes).where(eq(restaurantes.id, factura.restauranteId))

  const facturaId = factura.id
  async function handleRegeneratePdf(): Promise<void> {
    'use server'
    await regeneratePdf(facturaId)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-xl font-semibold text-zinc-900">{factura.numeroFactura}</h1>
      <div className="rounded-lg border border-zinc-200 bg-white divide-y divide-zinc-100">
        {([
          ['Fecha', factura.createdAt.toLocaleDateString('es-ES')],
          ['Tipo documento', factura.documentoTipo],
          ['Documento', factura.documentoId],
          ['Razón social', factura.razonSocial],
          ['Dirección', factura.direccionFacturacion],
          ['Email', factura.emailCliente ?? '—'],
          ['Base imponible', `${parseFloat(factura.baseImponible).toFixed(2)} €`],
          [`IVA (${+(parseFloat(factura.ivaRate)*100).toFixed(0)}%)`, `${parseFloat(factura.cuotaIva).toFixed(2)} €`],
          ['Total', `${parseFloat(factura.total).toFixed(2)} €`],
        ] as [string, string][]).map(([label, value]) => (
          <div key={label} className="flex justify-between px-4 py-3 text-sm">
            <span className="text-zinc-500">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-3">
        {factura.pdfUrl ? (
          <a href={factura.pdfUrl} target="_blank" rel="noreferrer"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700">
            Descargar PDF
          </a>
        ) : (
          <form action={handleRegeneratePdf}>
            <button type="submit"
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm hover:bg-zinc-50">
              Regenerar PDF
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
