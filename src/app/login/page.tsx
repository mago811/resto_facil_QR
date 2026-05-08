import { signIn } from '@/auth'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8">
        <h1 className="mb-6 text-xl font-semibold text-zinc-900">Panel de administración</h1>
        <form
          action={async (formData: FormData) => {
            'use server'
            await signIn('credentials', {
              email: formData.get('email'),
              password: formData.get('password'),
              redirectTo: '/admin/mesas',
            })
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-zinc-900">Email</label>
            <input id="email" name="email" type="email" required
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-zinc-900">Contraseña</label>
            <input id="password" name="password" type="password" required
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900" />
          </div>
          <button type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700">
            Entrar
          </button>
        </form>
      </div>
    </main>
  )
}
