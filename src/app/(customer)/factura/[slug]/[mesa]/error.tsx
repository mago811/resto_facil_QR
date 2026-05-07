'use client'

export default function FacturaError({
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-white p-6 text-center">
      <h1 className="text-lg font-semibold text-red-700">Ha ocurrido un error</h1>
      <p className="mt-2 text-sm text-zinc-500">No se pudo cargar la factura. Inténtalo de nuevo.</p>
      <button onClick={unstable_retry} className="mt-4 text-sm text-zinc-700 underline">Reintentar</button>
    </div>
  )
}
