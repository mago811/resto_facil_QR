export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-md px-4 py-8">
        {children}
      </div>
    </main>
  )
}
