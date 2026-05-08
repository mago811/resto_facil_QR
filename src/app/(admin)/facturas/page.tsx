// src/app/(admin)/facturas/page.tsx
import { auth } from '@/auth'
import { getInvoices } from '@/features/admin-invoices/get-invoices'
import { InvoiceList } from '@/features/admin-invoices/invoice-list'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ page?: string; nif?: string; desde?: string; hasta?: string }>
}

export default async function FacturasPage({ searchParams }: PageProps) {
  const params = await searchParams
  const session = await auth()
  const restauranteId = session!.user.restauranteId

  const page = params.page ? parseInt(params.page) : 1
  const { invoices, totalPages } = await getInvoices({
    restauranteId,
    page,
    nif: params.nif,
    fechaDesde: params.desde,
    fechaHasta: params.hasta,
  })

  const buildPageUrl = (p: number) => {
    const qs = new URLSearchParams()
    if (params.nif) qs.set('nif', params.nif)
    if (params.desde) qs.set('desde', params.desde)
    if (params.hasta) qs.set('hasta', params.hasta)
    qs.set('page', String(p))
    return `/admin/facturas?${qs.toString()}`
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Facturas</h1>
        <Link href={`/api/facturas/csv`}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm hover:bg-zinc-50">
          Exportar CSV
        </Link>
      </div>

      <div className="mb-4 flex gap-3">
        <form method="GET" className="flex gap-2 flex-wrap">
          <input name="nif" defaultValue={params.nif} placeholder="Buscar NIF/CIF"
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm" />
          <input name="desde" type="date" defaultValue={params.desde}
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm" />
          <input name="hasta" type="date" defaultValue={params.hasta}
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm" />
          <button type="submit" className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white">Filtrar</button>
        </form>
      </div>

      <InvoiceList invoices={invoices} />

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link href={buildPageUrl(page - 1)}
              className="rounded border border-zinc-300 bg-white px-3 py-1.5 hover:bg-zinc-50">
              ← Anterior
            </Link>
          ) : (
            <span />
          )}
          <span className="text-zinc-500">Página {page} de {totalPages}</span>
          {page < totalPages ? (
            <Link href={buildPageUrl(page + 1)}
              className="rounded border border-zinc-300 bg-white px-3 py-1.5 hover:bg-zinc-50">
              Siguiente →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  )
}
