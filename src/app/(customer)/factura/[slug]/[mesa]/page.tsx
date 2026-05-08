import { notFound } from 'next/navigation'
import { getActiveSession } from '@/features/qr-session/get-active-session'
import { TaxForm } from '@/features/tax-form/tax-form'
import { emitInvoice } from '@/features/invoice-emit/actions'
import { calcularIVA } from '@/shared/lib/tax/iva'

interface PageProps {
  params: Promise<{ slug: string; mesa: string }>
}

export default async function FacturaPage({ params }: PageProps) {
  const { slug, mesa } = await params
  const mesaNumero = parseInt(mesa, 10)
  if (isNaN(mesaNumero)) notFound()

  const session = await getActiveSession(slug, mesaNumero)
  if (!session) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center">
        <h1 className="text-lg font-semibold text-zinc-900">Sin consumo activo</h1>
        <p className="mt-2 text-sm text-zinc-500">
          No hay ningún consumo abierto en la mesa {mesaNumero}.
          Consulta con el personal del restaurante.
        </p>
      </div>
    )
  }

  const { baseImponible, cuotaIva, total } = calcularIVA(
    parseFloat(session.sesion.subtotal),
    parseFloat(session.restaurante.ivaPorcentaje)
  )

  const sesionId = session.sesion.id
  const restauranteId = session.restaurante.id

  async function boundAction(prevState: unknown, formData: FormData) {
    'use server'
    return emitInvoice(prevState, formData, sesionId, restauranteId)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h1 className="text-lg font-semibold text-zinc-900">Solicitar factura</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Mesa {session.mesa.numero}{session.mesa.nombre ? ` — ${session.mesa.nombre}` : ''}
        </p>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Base imponible</span>
            <span>{baseImponible.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">IVA ({+(parseFloat(session.restaurante.ivaPorcentaje) * 100).toFixed(0)}%)</span>
            <span>{cuotaIva.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between border-t border-zinc-100 pt-2 font-semibold">
            <span>Total</span>
            <span>{total.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900">Tus datos fiscales</h2>
        <TaxForm action={boundAction} restauranteSlug={slug} />
      </div>
    </div>
  )
}
