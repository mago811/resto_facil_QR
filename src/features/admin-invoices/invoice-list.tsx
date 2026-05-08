// src/features/admin-invoices/invoice-list.tsx
import Link from 'next/link'

interface Invoice {
  id: string
  numeroFactura: string
  documentoTipo: string
  documentoId: string
  razonSocial: string
  total: string
  pdfUrl: string | null
  createdAt: Date
  mesaNumero: number | null
}

interface InvoiceListProps {
  invoices: Invoice[]
}

export function InvoiceList({ invoices }: InvoiceListProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <table className="w-full text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-500">
          <tr>
            {['Número', 'Fecha', 'Mesa', 'NIF/CIF/NIE', 'Total', 'PDF'].map(h => (
              <th key={h} className="px-4 py-3 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {invoices.map(f => (
            <tr key={f.id} className="hover:bg-zinc-50">
              <td className="px-4 py-3 font-mono text-xs">{f.numeroFactura}</td>
              <td className="px-4 py-3 text-zinc-500">{f.createdAt.toLocaleDateString('es-ES')}</td>
              <td className="px-4 py-3">{f.mesaNumero != null ? `Mesa ${f.mesaNumero}` : '—'}</td>
              <td className="px-4 py-3 font-mono text-xs">
                <span className="text-zinc-400 text-xs mr-1">{f.documentoTipo}</span>
                {f.documentoId}
              </td>
              <td className="px-4 py-3 font-semibold">{parseFloat(f.total).toFixed(2)} €</td>
              <td className="px-4 py-3">
                {f.pdfUrl ? (
                  <Link href={f.pdfUrl} target="_blank" className="text-zinc-500 hover:text-zinc-900">
                    PDF →
                  </Link>
                ) : (
                  <Link href={`/admin/facturas/${f.id}`} className="text-zinc-500 hover:text-zinc-900">
                    Ver →
                  </Link>
                )}
              </td>
            </tr>
          ))}
          {invoices.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                Sin resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
