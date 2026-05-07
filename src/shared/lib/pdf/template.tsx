// src/shared/lib/pdf/template.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: 'Helvetica', fontSize: 10, color: '#111' },
  header: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#555' },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase', color: '#555', marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  label: { color: '#555' },
  value: { fontWeight: 'bold' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#111', marginTop: 8 },
  totalLabel: { fontSize: 12, fontWeight: 'bold' },
  totalValue: { fontSize: 12, fontWeight: 'bold' },
  footer: { marginTop: 32, fontSize: 8, color: '#888', textAlign: 'center' },
})

export interface InvoicePDFProps {
  factura: {
    numeroFactura: string
    createdAt: Date
    documentoTipo: string
    documentoId: string
    razonSocial: string
    direccionFacturacion: string
    baseImponible: string
    ivaRate: string
    cuotaIva: string
    total: string
  }
  restaurante: {
    razonSocial: string
    cif: string
    direccion: string
  }
}

export function InvoicePDF({ factura, restaurante }: InvoicePDFProps) {
  const ivaPercent = +(parseFloat(factura.ivaRate) * 100).toFixed(0)
  const date = new Date(factura.createdAt).toLocaleDateString('es-ES')
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>FACTURA</Text>
          <Text style={styles.subtitle}>{factura.numeroFactura} · {date}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emisor</Text>
          <Text>{restaurante.razonSocial}</Text>
          <Text>CIF: {restaurante.cif}</Text>
          <Text>{restaurante.direccion}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receptor</Text>
          <Text>{factura.razonSocial}</Text>
          <Text>{factura.documentoTipo}: {factura.documentoId}</Text>
          <Text>{factura.direccionFacturacion}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desglose</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Base imponible</Text>
            <Text style={styles.value}>{parseFloat(factura.baseImponible).toFixed(2)} €</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>IVA ({ivaPercent}%)</Text>
            <Text style={styles.value}>{parseFloat(factura.cuotaIva).toFixed(2)} €</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{parseFloat(factura.total).toFixed(2)} €</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Factura emitida conforme a la normativa AEAT. Conserve este documento para su contabilidad.
        </Text>
      </Page>
    </Document>
  )
}
