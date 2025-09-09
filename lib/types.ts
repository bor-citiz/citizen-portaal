export interface Project {
  id: string
  projectnaam: string
  locatie: string | null
  status: string
  created_at: string
}

export interface Activity {
  id: string
  type: ActivityType
  description: string
  timestamp: string
  project_name?: string
  created_at?: string
}

export type ActivityType = 'project_created' | 'stakeholder_added' | 'message_received'

export interface DashboardStats {
  total_projects: number
  open_messages: number
  pending_analysis: number
}

export const statusDisplayMap: Record<string, string> = {
  'draft': 'Concept',
  'active': 'Actief',
  'completed': 'Afgerond',
  'on_hold': 'On hold',
  'pending_analysis': 'In analyse'
}

export const statusStyles: Record<string, string> = {
  'Concept': 'bg-gray-100 text-gray-700',
  'Actief': 'bg-green-100 text-green-700',
  'Afgerond': 'bg-blue-100 text-blue-700',
  'On hold': 'bg-yellow-100 text-yellow-700',
  'In analyse': 'bg-purple-100 text-purple-700'
}