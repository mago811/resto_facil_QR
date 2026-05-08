// src/features/admin-mesas/actions.ts
'use server'
import { db, mesas, sesionesPos } from '@/shared/db'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const createMesaSchema = z.object({
  numero: z.coerce.number().int().positive(),
  nombre: z.string().optional(),
  restauranteId: z.string().uuid(),
})

export async function createMesa(formData: FormData) {
  const parsed = createMesaSchema.safeParse({
    numero: formData.get('numero'),
    nombre: formData.get('nombre') || undefined,
    restauranteId: formData.get('restauranteId'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  await db.insert(mesas).values(parsed.data)
  revalidatePath('/admin/mesas')
}

export async function toggleMesa(mesaId: string, activa: boolean) {
  await db.update(mesas).set({ activa }).where(eq(mesas.id, mesaId))
  revalidatePath('/admin/mesas')
}

export async function cerrarSesion(sesionId: string) {
  await db.update(sesionesPos).set({ estado: 'cerrada' }).where(eq(sesionesPos.id, sesionId))
  revalidatePath('/admin/mesas')
}

const createSesionSchema = z.object({
  mesaId: z.string().uuid(),
  subtotal: z.coerce.number().positive(),
  descripcion: z.string().optional(),
})

export async function createSesionPos(formData: FormData) {
  const parsed = createSesionSchema.safeParse({
    mesaId: formData.get('mesaId'),
    subtotal: formData.get('subtotal'),
    descripcion: formData.get('descripcion') || undefined,
  })
  if (!parsed.success) return { error: parsed.error.issues[0]?.message }
  await db.insert(sesionesPos).values({
    ...parsed.data,
    subtotal: String(parsed.data.subtotal),
  })
  revalidatePath('/admin/mesas')
}
