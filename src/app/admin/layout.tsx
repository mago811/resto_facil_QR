import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-zinc-900 text-zinc-100 flex flex-col">
        <div className="px-6 py-5 font-bold text-white border-b border-zinc-700">Resto Fácil QR</div>
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {[
            { href: '/admin/mesas', label: 'Mesas' },
            { href: '/admin/facturas', label: 'Facturas' },
            { href: '/admin/configuracion', label: 'Configuración' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="rounded px-3 py-2 text-sm hover:bg-zinc-700 transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
        <form
          action={async () => {
            'use server'
            await signOut({ redirectTo: '/login' })
          }}
          className="p-4"
        >
          <button type="submit" className="w-full rounded px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 text-left">
            Cerrar sesión
          </button>
        </form>
        <div className="px-6 pb-4 text-xs text-zinc-600">v0.1.0</div>
      </aside>
      <main className="flex-1 bg-zinc-50 p-8 text-zinc-900">{children}</main>
    </div>
  )
}
