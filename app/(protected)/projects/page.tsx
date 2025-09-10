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

  // Temporarily return mock data while RLS policies are being fixed
  console.log('User ID:', user.id, 'Email:', user.email)
  
  // Mock projects data to demonstrate the UI
  const byCreator: any[] = [
    {
      id: 'mock-1',
      projectnaam: 'Voorbeeld Project 1',
      status: 'active',
      locatie: 'Amsterdam',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
    },
    {
      id: 'mock-2', 
      projectnaam: 'Voorbeeld Project 2',
      status: 'draft',
      locatie: 'Rotterdam',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
    },
    {
      id: 'mock-3',
      projectnaam: 'Voorbeeld Project 3', 
      status: 'completed',
      locatie: null,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
    }
  ]
  
  const memErr: any = null

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