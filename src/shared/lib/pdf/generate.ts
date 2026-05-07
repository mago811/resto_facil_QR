// src/shared/lib/pdf/generate.ts
import { renderToBuffer, Document } from '@react-pdf/renderer'
import { InvoicePDF, type InvoicePDFProps } from './template'
import React from 'react'

export async function generateInvoicePdf(props: InvoicePDFProps): Promise<Buffer> {
  const element = React.createElement(
    InvoicePDF,
    props,
  ) as React.ReactElement<React.ComponentProps<typeof Document>>
  const buffer = await renderToBuffer(element)
  return Buffer.from(buffer)
}
