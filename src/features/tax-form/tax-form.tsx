'use client'
import { useActionState, useState, useEffect, useRef } from 'react'
import { Input } from '@/shared/ui/input'
import { Select } from '@/shared/ui/select'
import { Button } from '@/shared/ui/button'
import { validateSpanishId } from '@/shared/lib/validators/spanish-id'
import type { DocumentoTipo } from '@/entities/invoice/types'
import type { EmitInvoiceResult } from '@/features/invoice-emit/actions'

interface EmpresaSuggestion {
  documentoTipo: string
  documentoId: string
  razonSocial: string
  direccionFacturacion: string
}

interface TaxFormProps {
  action: (prevState: unknown, formData: FormData) => Promise<unknown>
  restauranteSlug: string
}

export function TaxForm({ action, restauranteSlug }: TaxFormProps) {
  const [state, formAction, pending] = useActionState(action, null)
  const [docTipo, setDocTipo] = useState<DocumentoTipo>('NIF')
  const [docId, setDocId] = useState('')
  const [razonSocial, setRazonSocial] = useState('')
  const [direccion, setDireccion] = useState('')
  const [docError, setDocError] = useState('')
  const [suggestions, setSuggestions] = useState<EmpresaSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  function validateDocOnBlur(value: string) {
    setDocError(value && !validateSpanishId(docTipo, value) ? 'Documento de identidad no válido' : '')
  }

  function search(query: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) { setSuggestions([]); setShowSuggestions(false); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/empresas?slug=${encodeURIComponent(restauranteSlug)}&q=${encodeURIComponent(query)}`)
        const data: EmpresaSuggestion[] = await res.json()
        setSuggestions(data)
        setShowSuggestions(data.length > 0)
      } catch {
        setSuggestions([])
      }
    }, 250)
  }

  function selectSuggestion(s: EmpresaSuggestion) {
    setDocTipo(s.documentoTipo as DocumentoTipo)
    setDocId(s.documentoId)
    setRazonSocial(s.razonSocial)
    setDireccion(s.direccionFacturacion)
    setSuggestions([])
    setShowSuggestions(false)
    setDocError('')
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const result = state as EmitInvoiceResult | null

  if (result?.facturaId) {
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
        ) : result.error ? (
          <p className="text-xs text-red-600">Error al generar el PDF: {result.error}</p>
        ) : (
          <p className="text-xs text-zinc-500">El PDF se está generando. Recarga en unos segundos.</p>
        )}
      </div>
    )
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* Razón social — primary search field */}
      <div ref={wrapperRef} className="relative">
        <Input
          label="Razón social / Nombre completo" name="razonSocial" required
          placeholder="Empresa Ficticia SL"
          value={razonSocial}
          onChange={e => { setRazonSocial(e.target.value); search(e.target.value) }}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
          autoComplete="off"
        />
        {showSuggestions && (
          <ul className="absolute z-10 mt-1 w-full rounded-md border border-zinc-200 bg-white shadow-lg divide-y divide-zinc-100">
            {suggestions.map(s => (
              <li key={s.documentoId}
                onMouseDown={() => selectSuggestion(s)}
                className="cursor-pointer px-3 py-2.5 hover:bg-zinc-50">
                <p className="text-sm font-medium text-zinc-900">{s.razonSocial}</p>
                <p className="text-xs text-zinc-500">{s.documentoTipo} {s.documentoId}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Select
        label="Tipo de documento" name="documentoTipo" required
        value={docTipo} onChange={e => setDocTipo(e.target.value as DocumentoTipo)}
        options={[
          { value: 'NIF', label: 'NIF (personas físicas)' },
          { value: 'CIF', label: 'CIF (empresas)' },
          { value: 'NIE', label: 'NIE (extranjeros)' },
        ]}
      />
      <Input
        label="Número de documento" name="documentoId" required
        placeholder="12345678Z"
        value={docId}
        onChange={e => setDocId(e.target.value)}
        onBlur={e => validateDocOnBlur(e.target.value)}
        error={docError}
        autoComplete="off"
      />
      <Input
        label="Dirección de facturación" name="direccionFacturacion" required
        placeholder="Calle Falsa 123, 28000 Madrid"
        value={direccion}
        onChange={e => setDireccion(e.target.value)}
      />
      <Input label="Email (opcional)" name="emailCliente" type="email" placeholder="cliente@ejemplo.com" />
      {result?.error && !result.facturaId && <p className="text-sm text-red-600" role="alert">{result.error}</p>}
      <Button type="submit" loading={pending}>Emitir factura</Button>
    </form>
  )
}
