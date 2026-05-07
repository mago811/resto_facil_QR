'use client'
import { useActionState, useState } from 'react'
import { Input } from '@/shared/ui/input'
import { Select } from '@/shared/ui/select'
import { Button } from '@/shared/ui/button'
import { validateSpanishId } from '@/shared/lib/validators/spanish-id'
import type { DocumentoTipo } from '@/entities/invoice/types'
import type { EmitInvoiceResult } from '@/features/invoice-emit/actions'

interface TaxFormProps {
  action: (prevState: unknown, formData: FormData) => Promise<unknown>
}

export function TaxForm({ action }: TaxFormProps) {
  const [state, formAction, pending] = useActionState(action, null)
  const [docTipo, setDocTipo] = useState<DocumentoTipo>('NIF')
  const [docError, setDocError] = useState('')

  function validateDocOnBlur(value: string) {
    setDocError(value && !validateSpanishId(docTipo, value) ? 'Documento de identidad no válido' : '')
  }

  const result = state as EmitInvoiceResult | null

  if (result?.facturaId && !result.error) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="text-3xl">✅</div>
        <h2 className="font-semibold text-zinc-900">Factura emitida</h2>
        <p className="text-sm text-zinc-500">{result.numeroFactura}</p>
        {result.emailSent && (
          <p className="text-sm text-green-600">Hemos enviado una copia a tu correo.</p>
        )}
        {result.pdfUrl ? (
          <a href={result.pdfUrl} target="_blank" rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700">
            Descargar PDF
          </a>
        ) : (
          <p className="text-xs text-zinc-400">El PDF se está generando. Recarga en unos segundos.</p>
        )}
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Select
        label="Tipo de documento" name="documentoTipo" required
        value={docTipo} onChange={e => setDocTipo(e.target.value as DocumentoTipo)}
        options={[
          { value: 'NIF', label: 'NIF (personas físicas)' },
          { value: 'CIF', label: 'CIF (empresas)' },
          { value: 'NIE', label: 'NIE (extranjeros)' },
        ]}
      />
      <Input label="Número de documento" name="documentoId" required
        placeholder="12345678Z" onBlur={e => validateDocOnBlur(e.target.value)} error={docError} />
      <Input label="Razón social / Nombre completo" name="razonSocial" required placeholder="Empresa Ficticia SL" />
      <Input label="Dirección de facturación" name="direccionFacturacion" required placeholder="Calle Falsa 123, 28000 Madrid" />
      <Input label="Email (opcional)" name="emailCliente" type="email" placeholder="cliente@ejemplo.com" />
      {result?.error && <p className="text-sm text-red-600" role="alert">{result.error}</p>}
      <Button type="submit" loading={pending}>Emitir factura</Button>
    </form>
  )
}
