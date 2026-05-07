// scripts/seed.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { restaurantes, usuarios, mesas, sesionesPos } from '../src/shared/db/schema'
import bcrypt from 'bcryptjs'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL environment variable is not set')

const sql = neon(url)
const db = drizzle(sql, { schema: { restaurantes, usuarios, mesas, sesionesPos } })

async function seed() {
  const [restaurante] = await db.insert(restaurantes).values({
    slug: 'demo',
    nombre: 'Restaurante Demo',
    cif: 'B12345678',
    razonSocial: 'Demo Restaurante SL',
    direccion: 'Calle Falsa 123, 28000 Madrid',
    posApiKey: 'pos-secret-demo-key',
  }).onConflictDoNothing().returning()

  if (!restaurante) {
    console.log('Already seeded — demo restaurante already exists.')
    return
  }

  await db.insert(usuarios).values({
    email: 'admin@demo.com',
    passwordHash: await bcrypt.hash('password123', 10),
    restauranteId: restaurante.id,
  }).onConflictDoNothing()

  const mesasData = [1, 2, 3, 4].map(n => ({
    numero: n,
    nombre: `Mesa ${n}`,
    restauranteId: restaurante.id,
  }))
  const createdMesas = await db.insert(mesas).values(mesasData).onConflictDoNothing().returning()

  const firstMesa = createdMesas[0]
  if (!firstMesa) {
    console.log('Mesas already exist — skipping sesion_pos seed.')
    return
  }

  await db.insert(sesionesPos).values({
    mesaId: firstMesa.id,
    subtotal: '45.00',
    descripcion: 'Menú del día x2 + bebidas',
  }).onConflictDoNothing()

  console.log('Seed complete. Login: admin@demo.com')
}

seed().catch(console.error)
