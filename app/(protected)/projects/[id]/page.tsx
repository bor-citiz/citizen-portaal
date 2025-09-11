import { notFound } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceSupabase } from '@/lib/supabase/service'
import ProjectDetailClient from './components/ProjectDetailClient'
import type { Project } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

async function getProject(id: string): Promise<Project & { stakeholders?: any[] } | null> {
  try {
    // Use service role to bypass RLS
    const serviceSupabase = createServiceSupabase()
    
    const { data: project, error } = await serviceSupabase
      .from('projects')
      .select(`
        id,
        projectnaam,
        locatie,
        status,
        created_at,
        radius_meters,
        omschrijving_werkzaamheden,
        globale_planning
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
      return null
    }

    // Parse stakeholders from analysis result if available
    // Note: For now, we'll simulate this until the analysis_result column is added
    let stakeholders: any[] = []
    
    if (project.status === 'active') {
      // In production, this would come from project.analysis_result
      // For now, we'll fetch from a mock or wait for the column to be added
      stakeholders = []
    }

    return {
      ...project,
      stakeholders
    }
  } catch (error) {
    console.error('Unexpected error fetching project:', error)
    return null
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params
  
  // Verify user is authenticated
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    notFound()
  }

  const project = await getProject(id)
  
  if (!project) {
    notFound()
  }

  return <ProjectDetailClient project={project} />
}