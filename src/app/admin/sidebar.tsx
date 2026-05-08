'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/admin/mesas', label: 'Mesas' },
  { href: '/admin/facturas', label: 'Facturas' },
  { href: '/admin/configuracion', label: 'Configuración' },
]

export function AdminSidebar({ signOut }: { signOut: () => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center h-14 bg-zinc-900 px-4 gap-3">
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="flex flex-col justify-center gap-1.5 p-1"
        >
          <span className="block w-5 h-0.5 bg-white rounded" />
          <span className="block w-5 h-0.5 bg-white rounded" />
          <span className="block w-5 h-0.5 bg-white rounded" />
        </button>
        <span className="font-bold text-white text-sm">Resto Fácil QR</span>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-zinc-900 text-zinc-100',
          'transition-transform duration-200 ease-in-out',
          'lg:static lg:w-56 lg:translate-x-0 lg:transition-none',
          open ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="px-6 py-5 font-bold text-white border-b border-zinc-700 flex items-center justify-between">
          Resto Fácil QR
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-white text-xl leading-none"
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4 flex-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={[
                'rounded px-3 py-2.5 text-sm transition-colors',
                pathname.startsWith(item.href)
                  ? 'bg-zinc-700 text-white font-medium'
                  : 'text-zinc-300 hover:bg-zinc-700 hover:text-white',
              ].join(' ')}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form action={signOut} className="p-4">
          <button
            type="submit"
            className="w-full rounded px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 text-left transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
        <div className="px-6 pb-4 text-xs text-zinc-600">v0.1.0</div>
      </aside>
    </>
  )
}
