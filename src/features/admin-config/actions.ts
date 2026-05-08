// src/features/admin-config/actions.ts
'use server'
import { db, restaurantes } from '@/shared/db'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const configSchema = z.object({
  nombre: z.string().min(1),
  cif: z.string().min(9).max(10),
  razonSocial: z.string().min(1),
  direccion: z.string().min(5),
  ivaPorcentaje: z.coerce.number().min(0).max(1),
  restauranteId: z.string().uuid(),
})

export async function updateConfig(formData: FormData) {
  const parsed = configSchema.safeParse({
    nombre: formData.get('nombre'),
    cif: formData.get('cif'),
    razonSocial: formData.get('razonSocial'),
    direccion: formData.get('direccion'),
    ivaPorcentaje: parseFloat(String(formData.get('ivaPorcentaje') ?? '0.10')),
    restauranteId: formData.get('restauranteId'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  const { restauranteId, ...data } = parsed.data
  await db.update(restaurantes)
    .set({ ...data, ivaPorcentaje: String(data.ivaPorcentaje) })
    .where(eq(restaurantes.id, restauranteId))
  revalidatePath('/admin/configuracion')
}
