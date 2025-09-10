import { createServerSupabase } from '@/lib/supabase/server'
import ProjectsPageClient from './components/ProjectsPageClient'
import type { ProjectStatus } from '@/lib/types'

type ProjectRow = {
  id: string
  projectnaam: string | null
  status: string | null
  locatie: string | null
  created_at: string
}

export default async function ProjectsPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Projecten</h1>
        <p className="text-sm text-red-600">Je moet ingelogd zijn om projecten te bekijken.</p>
      </div>
    )
  }

  // Simple fallback to avoid RLS issues - return empty array for now
  let byCreator: any[] = []
  let memErr: any = null
  
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id, projectnaam, status, locatie, created_at')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Projects query error:', error)
      memErr = error
    } else {
      byCreator = data || []
    }
  } catch (err) {
    console.error('Projects query exception:', err)
    memErr = err
    byCreator = []
  }

  // TODO: Add project membership query back once RLS policies are fixed
  const byMembership: any[] = []

  if (memErr) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Projecten</h1>
        <p className="text-sm text-red-600">Laden mislukt: {memErr.message}</p>
      </div>
    )
  }

  // Combine and deduplicate projects
  const map = new Map<string, ProjectRow>()
  ;(byMembership as ProjectRow[] || []).forEach((r: ProjectRow) => map.set(r.id, r))
  ;(byCreator as ProjectRow[] || []).forEach((r: ProjectRow) => map.set(r.id, r))
  const projects = Array.from(map.values())

  // Transform to match client component interface
  const transformedProjects = projects.map(project => ({
    id: project.id,
    projectnaam: project.projectnaam || 'Zonder naam',
    locatie: project.locatie,
    status: (project.status || 'draft') as ProjectStatus,
    created_at: project.created_at
  }))

  return <ProjectsPageClient projects={transformedProjects} />
}