import { createServerSupabase } from '@/lib/supabase/server'
import type { DashboardStats, Project, Activity } from '@/lib/types'

function formatTimeAgo(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Minder dan een uur geleden'
  if (diffInHours === 1) return '1 uur geleden'
  if (diffInHours < 24) return `${diffInHours} uur geleden`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return '1 dag geleden'
  if (diffInDays < 7) return `${diffInDays} dagen geleden`
  
  return past.toLocaleDateString('nl-NL')
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { total_projects: 0, open_messages: 0, pending_analysis: 0 }
  }

  // Get projects user has access to (via project_users or created_by)
  const { data: projectsByMembership } = await supabase
    .from('projects')
    .select('status, project_users!inner(user_id)')
    .eq('project_users.user_id', user.id)

  const { data: projectsByCreator } = await supabase
    .from('projects')
    .select('status')
    .eq('created_by', user.id)

  // Combine and deduplicate
  const allProjects = [
    ...(projectsByMembership || []),
    ...(projectsByCreator || [])
  ]

  return {
    total_projects: allProjects.length,
    open_messages: 0, // TODO: Implement when messages table exists
    pending_analysis: allProjects.filter(p => 
      p.status === 'pending_analysis' || p.status === 'draft'
    ).length
  }
}

export async function getRecentProjects(): Promise<Project[]> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  // Get projects by membership
  const { data: byMembership } = await supabase
    .from('projects')
    .select('id, projectnaam, locatie, status, created_at, project_users!inner(user_id)')
    .eq('project_users.user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get projects by creator
  const { data: byCreator } = await supabase
    .from('projects')
    .select('id, projectnaam, locatie, status, created_at')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Combine, deduplicate, and limit to 5
  const map = new Map<string, Project>()
  ;[...(byMembership || []), ...(byCreator || [])].forEach((project: any) => {
    map.set(project.id, project)
  })

  return Array.from(map.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
}

export async function getRecentActivities(): Promise<Activity[]> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  // For now, create activities from recent projects since we don't have activities table yet
  const recentProjects = await getRecentProjects()
  
  const activities: Activity[] = recentProjects.map((project) => ({
    id: `activity-${project.id}`,
    type: 'project_created' as const,
    description: `Project "${project.projectnaam}" is aangemaakt.`,
    project_name: project.projectnaam,
    created_at: project.created_at,
    timestamp: formatTimeAgo(project.created_at)
  }))

  // Add some mock stakeholder activities for demo
  if (activities.length > 0) {
    activities.splice(1, 0, {
      id: 'mock-stakeholder-1',
      type: 'stakeholder_added',
      description: 'Nieuwe stakeholder toegevoegd aan analyse.',
      project_name: activities[0].project_name,
      created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      timestamp: '3 uur geleden'
    })
  }

  return activities.slice(0, 4) // Limit to 4 activities
}