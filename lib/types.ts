// Dashboard and project types
export type ProjectStatus = 'draft' | 'pending_analysis' | 'analysis_complete' | 'active' | 'completed'

export interface Project {
  id: string
  projectnaam: string
  locatie: string | null
  status: ProjectStatus
  created_at: string
  stakeholder_count?: number
}

export type ActivityType = 'project_created' | 'stakeholder_added' | 'message_received'

export interface Activity {
  id: string
  type: ActivityType
  description: string
  project_name: string
  created_at: string
  timestamp: string // formatted time like "1 uur geleden"
}

export interface DashboardStats {
  total_projects: number
  open_messages: number
  pending_analysis: number
}

// Map your database status to display status
export const statusDisplayMap: Record<ProjectStatus, string> = {
  'draft': 'In afwachting',
  'pending_analysis': 'In afwachting', 
  'analysis_complete': 'Actief',
  'active': 'Actief',
  'completed': 'Voltooid'
}

export const statusStyles: Record<string, string> = {
  'Actief': 'bg-teal-100 text-[#23BFBF]',
  'In afwachting': 'bg-amber-100 text-amber-700',
  'Voltooid': 'bg-slate-200 text-[#5E79A5]',
}