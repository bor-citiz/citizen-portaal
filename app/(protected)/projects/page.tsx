import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

type Row = {
  id: string | number
  projectnaam: string | null
  status: string | null
  slug: string | null
  created_at: string
}

export default async function ProjectsPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Optie 1: projecten waarvan jij member bent (via project_users)
  const { data: byMembership, error: memErr } = await supabase
    .from('projects')
    .select('id, projectnaam, status, slug, created_at, project_users!inner(user_id)')
    .eq('project_users.user_id', user.id)
    .order('created_at', { ascending: false })

  // Optie 2: projecten die jij gemaakt hebt (created_by)
  const { data: byCreator } = await supabase
    .from('projects')
    .select('id, projectnaam, status, slug, created_at')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (memErr) {
    return (
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Projecten</h1>
        <p className="text-sm text-red-600">Laden mislukt: {memErr.message}</p>
      </section>
    )
  }

  // Combineer en dedupliceer (kan overlappen)
  const map = new Map<string | number, Row>()
  ;(byMembership as Row[] || []).forEach((r: Row) => map.set(r.id, r))
  ;(byCreator as Row[] || []).forEach((r: Row) => map.set(r.id, r))
  const rows = Array.from(map.values())

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Projecten</h1>
        <Button asChild>
          <Link href="/projects/new">Nieuw project</Link>
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">Nog geen projecten. Maak je eerste project aan.</p>
      ) : (
        <ul className="divide-y rounded-md border bg-white">
          {rows.map((p) => (
            <li key={p.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{p.projectnaam ?? 'Zonder naam'}</div>
                <div className="text-xs text-gray-500">
                  Status: {p.status ?? 'onbekend'} • Aangemaakt: {new Date(p.created_at).toLocaleString()}
                </div>
              </div>
              {/* Link naar detail volgt later */}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
