// src/features/invoice-emit/actions.ts
'use server'
import { db, facturas, sesionesPos, restaurantes, empresas } from '@/shared/db'
import { and, eq } from 'drizzle-orm'
import { taxFormSchema } from '@/features/tax-form/schema'
import { calcularIVA } from '@/shared/lib/tax/iva'
import { getNextNumeroFactura } from '@/shared/lib/numero-factura'
import { generateInvoicePdf } from '@/shared/lib/pdf/generate'
import { put } from '@vercel/blob'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmitInvoiceResult {
  facturaId: string
  pdfUrl: string | null
  numeroFactura: string
  emailSent: boolean
  error?: string
}

export async function emitInvoice(
  _prevState: unknown,
  formData: FormData,
  sesionId: string,
  restauranteId: string
): Promise<EmitInvoiceResult> {
  const raw = {
    documentoTipo: formData.get('documentoTipo'),
    documentoId: formData.get('documentoId'),
    razonSocial: formData.get('razonSocial'),
    direccionFacturacion: formData.get('direccionFacturacion'),
    emailCliente: formData.get('emailCliente') || undefined,
  }

  const parsed = taxFormSchema.safeParse(raw)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Error de validación'
    return { facturaId: '', pdfUrl: null, numeroFactura: '', emailSent: false, error: msg }
  }
  const data = parsed.data

  // Get restaurante for IVA rate
  const [restaurante] = await db.select().from(restaurantes).where(eq(restaurantes.id, restauranteId))
  if (!restaurante) return { facturaId: '', pdfUrl: null, numeroFactura: '', emailSent: false, error: 'Restaurante no encontrado' }

  // Get session
  const [sesion] = await db.select().from(sesionesPos).where(eq(sesionesPos.id, sesionId))
  if (!sesion) return { facturaId: '', pdfUrl: null, numeroFactura: '', emailSent: false, error: 'Sesión no encontrada' }
  if (sesion.estado === 'facturada') return { facturaId: '', pdfUrl: null, numeroFactura: '', emailSent: false, error: 'Ya existe una factura para esta sesión' }

  const ivaRate = parseFloat(restaurante.ivaPorcentaje)
  const { baseImponible, cuotaIva, total } = calcularIVA(parseFloat(sesion.subtotal), ivaRate)

  let facturaId = ''
  let numeroFactura = ''

  try {
    // Race condition guard — UNIQUE constraint is DB-level, but check first for a clear error message
    const existing = await db.select({ id: facturas.id }).from(facturas)
      .where(eq(facturas.sesionId, sesionId))
      .limit(1)
    if (existing.length > 0) throw new Error('DUPLICATE')

    // Verify session is still open
    const sesionActiva = await db.select({ id: sesionesPos.id }).from(sesionesPos)
      .where(and(eq(sesionesPos.id, sesionId), eq(sesionesPos.estado, 'abierta')))
      .limit(1)
    if (!sesionActiva[0]) throw new Error('DUPLICATE')

    // Atomic UPDATE to get next invoice number
    numeroFactura = await getNextNumeroFactura(db, restauranteId)

    const [factura] = await db.insert(facturas).values({
      numeroFactura,
      sesionId,
      restauranteId,
      documentoTipo: data.documentoTipo,
      documentoId: data.documentoId,
      razonSocial: data.razonSocial,
      direccionFacturacion: data.direccionFacturacion,
      emailCliente: data.emailCliente || null,
      baseImponible: String(baseImponible),
      ivaRate: String(ivaRate),
      cuotaIva: String(cuotaIva),
      total: String(total),
    }).returning()

    if (!factura) throw new Error('Insert did not return a row')
    facturaId = factura.id

    await db.update(sesionesPos)
      .set({ estado: 'facturada' })
      .where(eq(sesionesPos.id, sesionId))

    // Upsert company data for autocomplete (no email stored)
    await db.insert(empresas).values({
      restauranteId,
      documentoTipo: data.documentoTipo,
      documentoId: data.documentoId,
      razonSocial: data.razonSocial,
      direccionFacturacion: data.direccionFacturacion,
    }).onConflictDoUpdate({
      target: [empresas.restauranteId, empresas.documentoId],
      set: {
        documentoTipo: data.documentoTipo,
        razonSocial: data.razonSocial,
        direccionFacturacion: data.direccionFacturacion,
        updatedAt: new Date(),
      },
    })
  } catch (err) {
    const isDuplicate =
      err instanceof Error &&
      (err.message === 'DUPLICATE' ||
       ('code' in err && (err as { code: string }).code === '23505'))
    const msg = isDuplicate
      ? 'Ya existe una factura para esta sesión'
      : 'Error al crear la factura'
    return { facturaId: '', pdfUrl: null, numeroFactura: '', emailSent: false, error: msg }
  }

  // Generate + upload PDF (outside transaction — factura is already saved)
  let pdfUrl: string | null = null
  let pdfError: string | undefined
  try {
    const pdfBuffer = await generateInvoicePdf({
      factura: {
        numeroFactura,
        createdAt: new Date(),
        documentoTipo: data.documentoTipo,
        documentoId: data.documentoId,
        razonSocial: data.razonSocial,
        direccionFacturacion: data.direccionFacturacion,
        baseImponible: String(baseImponible),
        ivaRate: String(ivaRate),
        cuotaIva: String(cuotaIva),
        total: String(total),
      },
      restaurante: {
        razonSocial: restaurante.razonSocial,
        cif: restaurante.cif,
        direccion: restaurante.direccion,
      },
    })
    const blob = await put(`facturas/${facturaId}.pdf`, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf',
    })
    pdfUrl = blob.url
    await db.update(facturas).set({ pdfUrl }).where(eq(facturas.id, facturaId))
  } catch (err) {
    console.error('[PDF] generation/upload failed:', err)
    pdfError = err instanceof Error ? err.message : String(err)
  }

  // Send email (non-blocking, outside transaction)
  let emailSent = false
  if (data.emailCliente && pdfUrl) {
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'facturas@restofacil.es',
        to: data.emailCliente,
        subject: `Tu factura ${numeroFactura}`,
        html: `<p>Adjuntamos tu factura <strong>${numeroFactura}</strong>.</p><p><a href="${pdfUrl}">Descargar PDF</a></p>`,
      })
      emailSent = true
    } catch {
      // Email failure is silent
    }
  }

  return { facturaId, pdfUrl, numeroFactura, emailSent, error: pdfError }
}

export async function regeneratePdf(facturaId: string): Promise<{ pdfUrl: string | null }> {
  const [factura] = await db.select().from(facturas).where(eq(facturas.id, facturaId))
  if (!factura) return { pdfUrl: null }
  const [restaurante] = await db.select().from(restaurantes).where(eq(restaurantes.id, factura.restauranteId))
  if (!restaurante) return { pdfUrl: null }

  try {
    const pdfBuffer = await generateInvoicePdf({
      factura: {
        numeroFactura: factura.numeroFactura,
        createdAt: new Date(factura.createdAt),
        documentoTipo: factura.documentoTipo,
        documentoId: factura.documentoId,
        razonSocial: factura.razonSocial,
        direccionFacturacion: factura.direccionFacturacion,
        baseImponible: factura.baseImponible,
        ivaRate: factura.ivaRate,
        cuotaIva: factura.cuotaIva,
        total: factura.total,
      },
      restaurante: { razonSocial: restaurante.razonSocial, cif: restaurante.cif, direccion: restaurante.direccion },
    })
    const blob = await put(`facturas/${facturaId}.pdf`, pdfBuffer, { access: 'public', contentType: 'application/pdf' })
    await db.update(facturas).set({ pdfUrl: blob.url }).where(eq(facturas.id, facturaId))
    return { pdfUrl: blob.url }
  } catch (err) {
    console.error('[PDF] regenerate failed:', err)
    return { pdfUrl: null }
  }
}
