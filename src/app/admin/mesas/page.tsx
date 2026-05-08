// src/app/(admin)/mesas/page.tsx
import { auth } from '@/auth'
import { getMesasConSesion } from '@/features/admin-mesas/get-mesas'
import { createMesa, createSesionPos, toggleMesa } from '@/features/admin-mesas/actions'
import { QRGenerator } from '@/features/admin-mesas/qr-generator'
import { Button } from '@/shared/ui/button'
import { redirect } from 'next/navigation'

export default async function MesasPage() {
  const session = await auth()
  if (!session?.user?.restauranteId) redirect('/login')
  const restauranteId = session.user.restauranteId
  const restauranteSlug = session.user.restauranteSlug
  const mesasConSesion = await getMesasConSesion(restauranteId)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  async function handleCreateMesa(formData: FormData): Promise<void> {
    'use server'
    await createMesa(formData)
  }

  async function handleCreateSesionPos(formData: FormData): Promise<void> {
    'use server'
    await createSesionPos(formData)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Mesas</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {mesasConSesion.map(mesa => (
          <div key={mesa.id} className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-zinc-900">
                  Mesa {mesa.numero}{mesa.nombre ? ` — ${mesa.nombre}` : ''}
                </h3>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                  !mesa.activa ? 'bg-zinc-100 text-zinc-500' :
                  mesa.sesionActiva ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'
                }`}>
                  {!mesa.activa ? 'Desactivada' : mesa.sesionActiva ? `Abierta — ${mesa.sesionActiva.subtotal}€` : 'Sin sesión'}
                </span>
              </div>
              <form action={toggleMesa.bind(null, mesa.id, !mesa.activa) as (formData: FormData) => Promise<void>}>
                <Button type="submit" variant="ghost" className="text-xs">
                  {mesa.activa ? 'Desactivar' : 'Activar'}
                </Button>
              </form>
            </div>

            <div className="mt-4 border-t border-zinc-100 pt-4">
              <QRGenerator mesaNumero={mesa.numero} restauranteSlug={restauranteSlug} baseUrl={baseUrl} />
            </div>

            {!mesa.sesionActiva && mesa.activa && (
              <form action={handleCreateSesionPos} className="mt-3 flex flex-col gap-2">
                <input type="hidden" name="mesaId" value={mesa.id} />
                <input name="subtotal" type="number" step="0.01" placeholder="Subtotal (€)" required
                  className="rounded border border-zinc-300 px-2 py-1 text-sm" />
                <input name="descripcion" placeholder="Descripción (opcional)"
                  className="rounded border border-zinc-300 px-2 py-1 text-sm" />
                <Button type="submit" variant="secondary" className="text-xs">Abrir sesión</Button>
              </form>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold text-zinc-900">Nueva mesa</h2>
        <form action={handleCreateMesa} className="flex gap-3">
          <input type="hidden" name="restauranteId" value={restauranteId} />
          <input name="numero" type="number" placeholder="Número" required
            className="w-20 rounded border border-zinc-300 px-3 py-2 text-sm" />
          <input name="nombre" placeholder="Nombre (opcional)"
            className="flex-1 rounded border border-zinc-300 px-3 py-2 text-sm" />
          <Button type="submit">Crear mesa</Button>
        </form>
      </div>
    </div>
  )
}
