import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './sidebar'
import { PWAInstallPrompt } from '@/features/pwa/install-prompt'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  async function handleSignOut() {
    'use server'
    await signOut({ redirectTo: '/login' })
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar signOut={handleSignOut} />
      <main className="flex-1 bg-zinc-50 p-4 pt-[4.5rem] lg:p-8 lg:pt-8 text-zinc-900 min-w-0">
        {children}
      </main>
      <PWAInstallPrompt />
    </div>
  )
}
