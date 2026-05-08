'use client'
// src/features/admin-config/config-form.tsx
import { updateConfig } from '@/features/admin-config/actions'

interface ConfigFormProps {
  config: {
    id: string
    nombre: string
    cif: string
    razonSocial: string
    direccion: string
    ivaPorcentaje: string
  }
}

export function ConfigForm({ config }: ConfigFormProps) {
  return (
    <form action={async (fd: FormData) => { await updateConfig(fd) }} className="rounded-lg border border-zinc-200 bg-white p-6 flex flex-col gap-4">
      <input type="hidden" name="restauranteId" value={config.id} />
      {([
        { name: 'nombre', label: 'Nombre del restaurante', defaultValue: config.nombre },
        { name: 'cif', label: 'CIF', defaultValue: config.cif },
        { name: 'razonSocial', label: 'Razón social', defaultValue: config.razonSocial },
        { name: 'direccion', label: 'Dirección fiscal', defaultValue: config.direccion },
      ] as { name: string; label: string; defaultValue: string }[]).map(f => (
        <div key={f.name} className="flex flex-col gap-1">
          <label className="text-sm font-medium text-zinc-900">{f.label}</label>
          <input name={f.name} defaultValue={f.defaultValue} required
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400" />
        </div>
      ))}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-zinc-900">IVA por defecto</label>
        <select name="ivaPorcentaje" defaultValue={config.ivaPorcentaje}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900">
          <option value="0.10">10% (Hostelería)</option>
          <option value="0.21">21% (General)</option>
          <option value="0.04">4% (Reducido)</option>
          <option value="0">0% (Exento)</option>
        </select>
      </div>
      <div className="rounded bg-zinc-50 border border-zinc-200 px-3 py-2 text-xs text-zinc-400">
        <span className="font-medium text-zinc-500">Integración ESC/POS</span> — disponible en próxima versión
      </div>
      <button type="submit"
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700">
        Guardar cambios
      </button>
    </form>
  )
}
