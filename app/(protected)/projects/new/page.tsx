import { createProject } from './server-actions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NewProjectPage() {
  return (
    <section className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Nieuw project</h1>
      <form action={createProject} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Projectnaam</label>
          <input name="projectnaam" required className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Bijv. Renovatie Brug Zeeburg" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Locatie (adres/stad)</label>
          <input name="locatie" className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Amsterdam" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Radius (meters)</label>
          <input name="radius_meters" type="number" min="0" className="w-full rounded-md border px-3 py-2 text-sm" placeholder="500" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Omschrijving Werkzaamheden &amp; Machines</label>
          <textarea name="omschrijving_werkzaamheden" rows={3} className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Globale Planning &amp; Werktijden</label>
          <textarea name="globale_planning" rows={2} className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Omleidingen &amp; Bereikbaarheidsissues</label>
          <textarea name="omleidingen_bereikbaarheidsissues" rows={2} className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>

        <div className="flex gap-2">
          <Button type="submit">Aanmaken</Button>
          <Button asChild variant="outline"><Link href="/projects">Annuleren</Link></Button>
        </div>
      </form>
    </section>
  )
}
