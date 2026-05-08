// src/shared/db/schema.ts
import {
  pgTable, uuid, text, decimal, boolean, integer, timestamp, uniqueIndex
} from 'drizzle-orm/pg-core'

export const restaurantes = pgTable('restaurantes', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),          // e.g. "el-rincon" — used in QR URL
  nombre: text('nombre').notNull(),
  cif: text('cif').notNull(),
  razonSocial: text('razon_social').notNull(),
  direccion: text('direccion').notNull(),
  ivaPorcentaje: decimal('iva_porcentaje', { precision: 4, scale: 2 }).notNull().default('0.10'),
  facturaSeq: integer('factura_seq').notNull().default(0),
  posApiKey: text('pos_api_key'),                 // secret for POS polling endpoint auth
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const usuarios = pgTable('usuarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  restauranteId: uuid('restaurante_id').notNull().references(() => restaurantes.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const mesas = pgTable('mesas', {
  id: uuid('id').primaryKey().defaultRandom(),
  numero: integer('numero').notNull(),
  nombre: text('nombre'),
  restauranteId: uuid('restaurante_id').notNull().references(() => restaurantes.id),
  activa: boolean('activa').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const sesionesPos = pgTable('sesiones_pos', {
  id: uuid('id').primaryKey().defaultRandom(),
  mesaId: uuid('mesa_id').notNull().references(() => mesas.id),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  descripcion: text('descripcion'),
  estado: text('estado').notNull().default('abierta'), // abierta | facturada | cerrada
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const empresas = pgTable('empresas', {
  id: uuid('id').primaryKey().defaultRandom(),
  restauranteId: uuid('restaurante_id').notNull().references(() => restaurantes.id),
  documentoTipo: text('documento_tipo').notNull(), // NIF | CIF | NIE
  documentoId: text('documento_id').notNull(),
  razonSocial: text('razon_social').notNull(),
  direccionFacturacion: text('direccion_facturacion').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex('empresas_restaurante_documento_idx').on(t.restauranteId, t.documentoId),
])

export const facturas = pgTable('facturas', {
  id: uuid('id').primaryKey().defaultRandom(),
  numeroFactura: text('numero_factura').notNull().unique(),
  sesionId: uuid('sesion_id').notNull().references(() => sesionesPos.id).unique(),
  restauranteId: uuid('restaurante_id').notNull().references(() => restaurantes.id),
  documentoTipo: text('documento_tipo').notNull(), // NIF | CIF | NIE
  documentoId: text('documento_id').notNull(),
  razonSocial: text('razon_social').notNull(),
  direccionFacturacion: text('direccion_facturacion').notNull(),
  emailCliente: text('email_cliente'),
  baseImponible: decimal('base_imponible', { precision: 10, scale: 2 }).notNull(),
  ivaRate: decimal('iva_rate', { precision: 4, scale: 2 }).notNull(),
  cuotaIva: decimal('cuota_iva', { precision: 10, scale: 2 }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  pdfUrl: text('pdf_url'),
  impresa: boolean('impresa').notNull().default(false),   // ESC/POS: true after POS software ACKs
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
