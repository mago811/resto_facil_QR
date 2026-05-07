// src/features/invoice-emit/actions.ts (STUB — will be replaced in Task 11)
'use server'

export interface EmitInvoiceResult {
  facturaId: string
  pdfUrl: string | null
  numeroFactura: string
  emailSent: boolean
  error?: string
}

export async function emitInvoice(
  _prevState: unknown,
  _formData: FormData,
  _sesionId?: string,
  _restauranteId?: string
): Promise<EmitInvoiceResult> {
  throw new Error('Not implemented yet')
}

export async function regeneratePdf(_facturaId: string): Promise<{ pdfUrl: string | null }> {
  throw new Error('Not implemented yet')
}
