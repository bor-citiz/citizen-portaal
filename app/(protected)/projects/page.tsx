import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceSupabase } from '@/lib/supabase/service'
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

  console.log('Fetching projects for user:', user.email)
  
  try {
    // Use service role client to bypass all RLS issues completely
    const serviceSupabase = createServiceSupabase()
    
    // Get projects by creator using service role (no RLS)
    const { data: byCreator, error: creatorErr } = await serviceSupabase
      .from('projects')
      .select('id, projectnaam, status, locatie, created_at')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })

    console.log('Creator query (service role):', { data: byCreator, error: creatorErr })

    // Get project memberships using service role (no RLS)
    let byMembership: ProjectRow[] = []
    try {
      const { data: memberships } = await serviceSupabase
        .from('project_users')
        .select('project_id')
        .eq('user_id', user.id)

      if (memberships && memberships.length > 0) {
        const projectIds = memberships.map(m => m.project_id)
        const { data: memberProjects } = await serviceSupabase
          .from('projects')
          .select('id, projectnaam, status, locatie, created_at')
          .in('id', projectIds)
          .order('created_at', { ascending: false })
        
        byMembership = memberProjects || []
      }
    } catch (membershipError) {
      console.warn('Membership query failed:', membershipError)
    }

    console.log('Membership query result:', byMembership)

    // Combine and deduplicate projects
    const map = new Map<string, ProjectRow>()
    ;(byCreator as ProjectRow[] || []).forEach((r: ProjectRow) => map.set(r.id, r))
    ;byMembership.forEach((r: ProjectRow) => map.set(r.id, r))
    const projects = Array.from(map.values())

    console.log('Final projects:', projects)

    // Transform to match client component interface
    const transformedProjects = projects.map(project => ({
      id: project.id,
      projectnaam: project.projectnaam || 'Zonder naam',
      locatie: project.locatie,
      status: (project.status || 'draft') as ProjectStatus,
      created_at: project.created_at
    }))

    return <ProjectsPageClient projects={transformedProjects} />

  } catch (error) {
    console.error('Unexpected error:', error)
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Projecten</h1>
        <p className="text-sm text-red-600">Onverwachte fout: {(error as Error).message}</p>
      </div>
    )
  }
}