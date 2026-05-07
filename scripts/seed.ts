// scripts/seed.ts
import { config } from 'dotenv'
config({ path: '.env.local' })
import { db, restaurantes, usuarios, mesas, sesionesPos } from '../src/shared/db'
import bcrypt from 'bcryptjs'

async function seed() {
  const [restaurante] = await db.insert(restaurantes).values({
    slug: 'demo',
    nombre: 'Restaurante Demo',
    cif: 'B12345678',
    razonSocial: 'Demo Restaurante SL',
    direccion: 'Calle Falsa 123, 28000 Madrid',
    posApiKey: 'pos-secret-demo-key',
  }).returning()

  await db.insert(usuarios).values({
    email: 'admin@demo.com',
    passwordHash: await bcrypt.hash('password123', 10),
    restauranteId: restaurante!.id,
  })

  const mesasData = [1, 2, 3, 4].map(n => ({
    numero: n,
    nombre: `Mesa ${n}`,
    restauranteId: restaurante!.id,
  }))
  const createdMesas = await db.insert(mesas).values(mesasData).returning()

  // Open session on mesa 1
  await db.insert(sesionesPos).values({
    mesaId: createdMesas[0]!.id,
    subtotal: '45.00',
    descripcion: 'Menú del día x2 + bebidas',
  })

  console.log('Seed complete. admin@demo.com / password123')
}

seed().catch(console.error)
