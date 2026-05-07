// src/entities/invoice/types.ts
export type DocumentoTipo = 'NIF' | 'CIF' | 'NIE'

export interface Factura {
  id: string
  numeroFactura: string
  sesionId: string
  restauranteId: string
  documentoTipo: DocumentoTipo
  documentoId: string
  razonSocial: string
  direccionFacturacion: string
  emailCliente: string | null
  baseImponible: string
  ivaRate: string
  cuotaIva: string
  total: string
  pdfUrl: string | null
  createdAt: Date
}
