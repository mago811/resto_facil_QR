// src/features/tax-form/schema.ts
import { z } from 'zod'
import { validateSpanishId } from '@/shared/lib/validators/spanish-id'

export const taxFormSchema = z.object({
  documentoTipo: z.enum(['NIF', 'CIF', 'NIE']),
  documentoId: z.string().min(9).max(10),
  razonSocial: z.string().min(2).max(150),
  direccionFacturacion: z.string().min(5).max(250),
  emailCliente: z.string().email().optional().or(z.literal('')),
}).refine(
  data => validateSpanishId(data.documentoTipo, data.documentoId),
  { message: 'Documento de identidad no válido', path: ['documentoId'] }
)

export type TaxFormData = z.infer<typeof taxFormSchema>
