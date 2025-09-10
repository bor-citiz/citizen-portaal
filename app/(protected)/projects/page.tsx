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

  console.log('Fetching projects for user:', user.email)
  
  try {
    // First try to get projects by creator (simpler query, avoid RLS issues)
    let byCreator: ProjectRow[] = []
    try {
      const { data: creatorData, error: creatorErr } = await supabase
        .from('projects')
        .select('id, projectnaam, status, locatie, created_at')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
      
      if (!creatorErr) {
        byCreator = creatorData || []
      } else {
        console.warn('Creator query failed:', creatorErr)
      }
    } catch (creatorError) {
      console.warn('Creator query error:', creatorError)
    }

    console.log('Creator query:', { data: byCreator })

    // Try to get project memberships separately to avoid join issues
    let byMembership: ProjectRow[] = []
    try {
      const { data: memberships } = await supabase
        .from('project_users')
        .select('project_id')
        .eq('user_id', user.id)

      if (memberships && memberships.length > 0) {
        const projectIds = memberships.map(m => m.project_id)
        const { data: memberProjects } = await supabase
          .from('projects')
          .select('id, projectnaam, status, locatie, created_at')
          .in('id', projectIds)
          .order('created_at', { ascending: false })
        
        byMembership = memberProjects || []
      }
    } catch (membershipError) {
      console.warn('Membership query failed, skipping:', membershipError)
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