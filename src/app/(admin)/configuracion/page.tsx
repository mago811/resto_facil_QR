// src/app/(admin)/configuracion/page.tsx
import { auth } from '@/auth'
import { getRestauranteConfig } from '@/features/admin-config/get-config'
import { ConfigForm } from '@/features/admin-config/config-form'
import { notFound, redirect } from 'next/navigation'

export default async function ConfiguracionPage() {
  const session = await auth()
  if (!session?.user?.restauranteId) redirect('/login')
  const restauranteId = session.user.restauranteId
  const config = await getRestauranteConfig(restauranteId)
  if (!config) notFound()

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-xl font-semibold text-zinc-900">Configuración del restaurante</h1>
      <ConfigForm config={config} />
    </div>
  )
}
