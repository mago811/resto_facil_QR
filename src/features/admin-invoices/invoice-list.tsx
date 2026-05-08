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
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
      <table className="w-full text-sm min-w-[600px]">
        <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold text-zinc-900">
          <tr>
            {['Número', 'Fecha', 'Mesa', 'NIF/CIF/NIE', 'Total', 'PDF'].map(h => (
              <th key={h} className="px-4 py-3 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {invoices.map(f => (
            <tr key={f.id} className="hover:bg-zinc-50">
              <td className="px-4 py-3 font-mono text-xs text-zinc-900">{f.numeroFactura}</td>
              <td className="px-4 py-3 text-zinc-900">{new Date(f.createdAt).toLocaleDateString('es-ES')}</td>
              <td className="px-4 py-3 text-zinc-900">{f.mesaNumero != null ? `Mesa ${f.mesaNumero}` : '—'}</td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-900">
                <span className="text-zinc-500 text-xs mr-1">{f.documentoTipo}</span>
                {f.documentoId}
              </td>
              <td className="px-4 py-3 font-semibold text-zinc-900">{parseFloat(f.total).toFixed(2)} €</td>
              <td className="px-4 py-3">
                {f.pdfUrl ? (
                  <Link href={f.pdfUrl} target="_blank" className="text-zinc-900 hover:underline font-medium">
                    PDF →
                  </Link>
                ) : (
                  <Link href={`/admin/facturas/${f.id}`} className="text-zinc-900 hover:underline font-medium">
                    Ver →
                  </Link>
                )}
              </td>
            </tr>
          ))}
          {invoices.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                Sin resultados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
