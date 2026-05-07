# Resto Fácil QR — Spec de Diseño

**Fecha:** 2026-05-08  
**Estado:** Aprobado  
**Scope:** Flujo cliente QR → factura + panel admin completo (mesas, facturas, configuración)

---

## 1. Contexto

Webapp "zero-downtime" para hostelería española. El cliente escanea un QR en la mesa, introduce sus datos fiscales y obtiene una factura conforme a la AEAT con PDF descargable y copia por email. El restaurante gestiona mesas, sesiones POS (mock en esta fase) y consulta el historial de facturas desde un panel admin.

---

## 2. Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript strict |
| Arquitectura | Feature-Sliced Design (FSD) |
| ORM | Drizzle ORM |
| Base de datos | Neon (Postgres) |
| Validación | Zod |
| PDF | @react-pdf/renderer |
| Storage PDFs | Vercel Blob |
| Email | Resend |
| Auth (admin) | NextAuth.js |
| CSS | Tailwind CSS |
| Tests unitarios/integración | Vitest |
| Tests E2E | Playwright |

---

## 3. Arquitectura FSD

### Estructura de carpetas

```
src/
  app/
    (customer)/
      factura/[mesa]/         ← página pública QR
    (admin)/
      facturas/               ← listado y detalle de facturas
      mesas/                  ← gestión de mesas + generación QR
      configuracion/          ← datos fiscales del restaurante
    api/
      pdf/[id]/               ← Route Handler para descarga de PDF
  features/
    qr-session/               ← carga sesión POS activa por mesa
    tax-form/                 ← captura y validación de datos fiscales
    invoice-emit/             ← Server Action de emisión de factura
    admin-invoices/           ← listado, filtros, re-descarga, CSV AEAT
    admin-mesas/              ← CRUD mesas + generación QR PNG
    admin-config/             ← configuración fiscal del restaurante
  entities/
    mesa/                     ← modelo mesa + sesión POS
    invoice/                  ← modelo factura emitida
    restaurante/              ← modelo configuración fiscal
  shared/
    db/                       ← Drizzle schema + cliente Neon
    lib/
      validators/spanish-id.ts  ← validación NIF/CIF/NIE (Módulo 11)
      tax/iva.ts                ← cálculo bases imponibles y cuotas
    ui/                       ← componentes base (Button, Input, etc.)
```

### Reglas de dependencias

- Las capas solo importan hacia abajo: `app → features → entities → shared`. Nunca al revés.
- Sin imports laterales entre features. Si dos features comparten lógica, va a `entities` o `shared`.
- RSC por defecto. `"use client"` exclusivamente en nodos hoja interactivos (campos del formulario fiscal, selector tipo documento).
- Todas las mutaciones pasan por Server Actions validadas con Zod antes de tocar la DB.

---

## 4. Modelo de datos

### `restaurantes`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
nombre          text NOT NULL
cif             text NOT NULL
razon_social    text NOT NULL
direccion       text NOT NULL
iva_porcentaje  decimal(4,2) NOT NULL DEFAULT 0.10
created_at      timestamptz NOT NULL DEFAULT now()
```

### `usuarios`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
email           text NOT NULL UNIQUE
password_hash   text NOT NULL
restaurante_id  uuid NOT NULL REFERENCES restaurantes(id)
created_at      timestamptz NOT NULL DEFAULT now()
```

### `mesas`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
numero          integer NOT NULL
nombre          text                         -- ej. "Terraza 3" (opcional)
restaurante_id  uuid NOT NULL REFERENCES restaurantes(id)
activa          boolean NOT NULL DEFAULT true
created_at      timestamptz NOT NULL DEFAULT now()
```

### `sesiones_pos` _(mock POS — sustituible por integración real)_
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
mesa_id         uuid NOT NULL REFERENCES mesas(id)
subtotal        decimal(10,2) NOT NULL          -- base imponible PRE-IVA
descripcion     text
estado          text NOT NULL DEFAULT 'abierta'  -- abierta | facturada | cerrada
created_at      timestamptz NOT NULL DEFAULT now()
```

### `facturas`
```sql
id                    uuid PRIMARY KEY DEFAULT gen_random_uuid()
numero_factura        text NOT NULL UNIQUE           -- formato REST-YYYY-NNNN
sesion_id             uuid NOT NULL REFERENCES sesiones_pos(id) UNIQUE
restaurante_id        uuid NOT NULL REFERENCES restaurantes(id)
documento_tipo        text NOT NULL                  -- NIF | CIF | NIE
documento_id          text NOT NULL                  -- validado Módulo 11
razon_social          text NOT NULL
direccion_facturacion text NOT NULL
email_cliente         text                           -- opcional
base_imponible        decimal(10,2) NOT NULL
iva_rate              decimal(4,2) NOT NULL
cuota_iva             decimal(10,2) NOT NULL         -- almacenada, no calculada en runtime
total                 decimal(10,2) NOT NULL
pdf_url               text                           -- Vercel Blob URL (null si PDF pendiente)
created_at            timestamptz NOT NULL DEFAULT now()
```

**Notas de diseño:**
- `numero_factura` es secuencial por restaurante: `REST-YYYY-NNNN`. Generado en la Server Action con counter en DB dentro de la transacción.
- `cuota_iva` se almacena para garantizar inmutabilidad fiscal (la factura refleja el IVA en el momento de emisión, no el configurado actualmente).
- `UNIQUE` en `sesiones_pos(id)` dentro de `facturas` previene duplicados a nivel DB.
- `pdf_url` puede ser `null` si la generación falló; la factura sigue siendo válida.

---

## 5. Flujos

### 5.1 Flujo cliente (público)

```
GET /factura?mesa=12
  └─ RSC: busca sesión_pos activa para mesa 12
       ├─ Sin sesión → página de error "No hay consumo activo en esta mesa"
       └─ Con sesión → renderiza ticket + formulario fiscal

Formulario fiscal (campos):
  - Tipo de documento: NIF | CIF | NIE  (select)
  - Número de documento  (validación Módulo 11 on-blur, client-side)
  - Razón social / Nombre completo
  - Dirección de facturación
  - Email  (opcional, para recibir copia digital)

Server Action: emitInvoice(payload)
  1. Zod valida payload completo (incluyendo re-validación Módulo 11 server-side)
  2. Transacción Drizzle:
       a. Verifica que sesion_id no tenga factura (409 si existe)
       b. Genera numero_factura secuencial
       c. Inserta en `facturas` (pdf_url = null)
       d. Marca sesión como 'facturada'
  3. Genera PDF con @react-pdf/renderer
  4. Sube PDF a Vercel Blob
  5. Actualiza facturas.pdf_url
  6. Si email_cliente presente → envía email con PDF adjunto via Resend (fuera de transacción)
  └─ Retorna: { facturaId, pdfUrl, numeroFactura }

Página de confirmación:
  - Número de factura emitida
  - Botón "Descargar PDF"
  - Si email → "Hemos enviado una copia a tu correo"
  - Si pdf_url null → botón "Regenerar PDF" (llama a Server Action independiente)
```

### 5.2 Panel admin

**Mesas (`/admin/mesas`)**
- CRUD de mesas (número, nombre opcional, activar/desactivar)
- Crear sesión POS mock para una mesa (subtotal, descripción)
- Generar QR PNG con URL `/factura?mesa=N` — descargable
- Ver estado de cada mesa: abierta / facturada / cerrada / sin sesión

**Facturas (`/admin/facturas`)**
- Listado paginado con filtros: rango de fechas, número de mesa, NIF/CIF
- Ver detalle de factura
- Re-descargar PDF
- Exportar CSV compatible AEAT

**Configuración (`/admin/configuracion`)**
- Datos fiscales del restaurante (CIF, razón social, dirección)
- IVA por defecto (editable, default 10% hostelería)
- Gestión de usuarios admin del restaurante
- Placeholder: webhook ESC/POS (campo URL + secret, deshabilitado hasta integración real)

---

## 6. Validación fiscal española

Implementada en `shared/lib/validators/spanish-id.ts`, TypeScript puro sin dependencias externas.

**Algoritmo Módulo 11:**
- **NIF** (personas físicas): 8 dígitos + letra de control. Letra = `TRWAGMYFPDXBNJZSQVHLCKE`[número % 23]
- **NIE** (extranjeros): X/Y/Z + 7 dígitos + letra. X→0, Y→1, Z→2, misma tabla de letras.
- **CIF** (personas jurídicas): letra tipo + 7 dígitos + dígito/letra control. Algoritmo Módulo 10 específico por tipo.

La validación corre en cliente (on-blur, UX inmediata) y se re-valida en el Server Action (seguridad). Nunca se confía solo en la validación del cliente.

---

## 7. Cálculo de IVA

Centralizado en `shared/lib/tax/iva.ts`:

```typescript
// IVA hostelería España: 10%
function calcularIVA(subtotal: number, ivaRate: number) {
  const baseImponible = subtotal          // subtotal ya es base imponible (sin IVA)
  const cuotaIva = +(baseImponible * ivaRate).toFixed(2)
  const total = +(baseImponible + cuotaIva).toFixed(2)
  return { baseImponible, cuotaIva, total }
}
```

Toda aritmética fiscal usa `toFixed(2)` para evitar errores de coma flotante. Los valores se almacenan en columnas `decimal(10,2)` en Neon.

---

## 8. Manejo de errores y edge cases

| Caso | Comportamiento |
|---|---|
| Mesa sin sesión activa | RSC → página de error amigable, sin stack trace |
| Sesión ya facturada | Server Action → 409, mensaje claro al cliente |
| Doble envío concurrente | UNIQUE en `facturas(sesion_id)` → el segundo insert falla en DB |
| Fallo generación PDF | Factura guardada, `pdf_url = null`, botón "Regenerar PDF" en confirmación |
| Fallo envío email | No-op silencioso; badge en panel admin si Resend reporta error |
| NIF/CIF/NIE inválido | Bloqueado en cliente (on-blur) + rechazado en Server Action (Zod) |

---

## 9. Testing

### Unit (Vitest)
- `shared/lib/validators/spanish-id.ts` — suite exhaustiva: NIF válidos/inválidos, CIF por tipo, NIE con X/Y/Z
- `shared/lib/tax/iva.ts` — casos con importes decimales, redondeo, IVA 0%

### Integration (Vitest + Neon branch efímera)
- `emitInvoice()` happy path completo
- `emitInvoice()` con sesión ya facturada → error 409
- `emitInvoice()` concurrente → UNIQUE constraint
- Sin mocks de DB — los tests de integración usan Neon branching en CI

### E2E (Playwright)
- Golden path: `/factura?mesa=12` → rellenar formulario → confirmar → descargar PDF
- Mesa sin sesión activa → página de error correcta
- NIF inválido → error on-blur, submit bloqueado

---

## 10. Decisiones explícitas y fuera de scope

**Dentro de scope (v1):**
- Flujo cliente QR → formulario → factura → PDF → email
- Panel admin: mesas, sesiones mock, facturas, configuración
- Validación NIF/CIF/NIE Módulo 11
- Cumplimiento AEAT (numero_factura secuencial, IVA desglosado, datos emisor)

**Fuera de scope (v1) — preparado para extensión:**
- Integración real con POS externo (`sesiones_pos` es el punto de extensión)
- Spooler ESC/POS real (placeholder en config admin)
- Multi-restaurante SaaS (la tabla `restaurantes` existe, pero la auth v1 es single-tenant)
- Firma electrónica de facturas
