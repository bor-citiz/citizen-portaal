import React from 'react'
import { getDashboardStats, getRecentProjects, getRecentActivities } from '@/lib/dashboard'
import { statusDisplayMap, statusStyles, type Project, type Activity, type ActivityType } from '@/lib/types'
import { 
  FolderKanban, Inbox, BarChart3, MapPin, 
  PlusCircle, UserPlus, MessageSquarePlus,
  Building, Rss
} from '@/components/dashboard/icons'

// --- SUB-COMPONENTS ---

interface KpiCardProps {
  icon: React.ReactElement
  title: string
  value: string | number
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, title, value }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-[#64748B]">{title}</p>
      <p className="text-3xl font-bold text-[#0F172A] mt-1">{value}</p>
    </div>
    <div className="bg-slate-100 text-[#5E79A5] rounded-lg p-2">
      {icon}
    </div>
  </div>
)

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
  const displayStatus = statusDisplayMap[project.status] || project.status
  
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-[#0F172A]">{project.projectnaam}</h3>
          <p className="text-sm text-[#64748B] flex items-center mt-1">
            <MapPin className="mr-1.5" />
            {project.locatie || 'Geen locatie opgegeven'}
          </p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[displayStatus] || 'bg-gray-100 text-gray-700'}`}>
          {displayStatus}
        </span>
      </div>
    </div>
  )
}

const activityIcons: Record<ActivityType, React.ReactElement> = {
  'project_created': <PlusCircle className="text-[#5E79A5]" />,
  'stakeholder_added': <UserPlus className="text-[#DB64B5]" />,
  'message_received': <MessageSquarePlus className="text-[#23BFBF]" />,
}

const ActivityItem: React.FC<{ activity: Activity, isLast: boolean }> = ({ activity, isLast }) => (
  <li className="relative flex items-start gap-4">
    {!isLast && <div className="absolute left-4 top-5 h-full w-0.5 bg-slate-200" />}
    <div className="relative z-10 bg-white flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white">
      {activityIcons[activity.type]}
    </div>
    <div>
      <p className="text-sm text-[#0F172A]">{activity.description}</p>
      <p className="text-xs text-[#64748B] mt-0.5">{activity.timestamp}</p>
    </div>
  </li>
)

interface EmptyStateProps {
  icon: React.ReactElement
  title: string
  message: string
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message }) => (
  <div className="text-center bg-white p-10 rounded-2xl shadow-sm">
    <div className="mx-auto text-[#64748B] opacity-50">
      {icon}
    </div>
    <h3 className="mt-4 text-lg font-semibold text-[#0F172A]">{title}</h3>
    <p className="mt-1 text-sm text-[#64748B]">{message}</p>
  </div>
)

// --- MAIN DASHBOARD COMPONENT ---
export default async function DashboardPage() {
  // Fetch all data in parallel
  const [stats, projects, activities] = await Promise.all([
    getDashboardStats(),
    getRecentProjects(),
    getRecentActivities()
  ])

  return (
    <div className="p-4 sm:p-6 lg:p-8 font-sans">
      <div className="relative">
        <div className="absolute top-0 left-0 -ml-4 sm:-ml-6 lg:-ml-8 w-full h-1 bg-gradient-to-r from-[#DB64B5] via-[#5E79A5] to-[#23BFBF]" />
        <h1 className="text-3xl font-bold text-[#0F172A] pt-4">Dashboard</h1>
      </div>

      <section aria-labelledby="kpi-title" className="mt-8">
        <h2 id="kpi-title" className="sr-only">Key Performance Indicators</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard icon={<FolderKanban />} title="Projecten" value={stats.total_projects} />
          <KpiCard icon={<Inbox />} title="Open berichten" value={stats.open_messages} />
          <KpiCard icon={<BarChart3 />} title="Analyse taken" value={stats.pending_analysis} />
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <section aria-labelledby="projects-title" className="lg:col-span-2">
          <h2 id="projects-title" className="text-xl font-semibold text-[#0F172A]">Jouw recente projecten</h2>
          <div className="mt-4 space-y-4">
            {projects.length > 0 ? (
              projects.map(project => <ProjectCard key={project.id} project={project} />)
            ) : (
              <EmptyState 
                icon={<Building className="h-12 w-12" />} 
                title="Geen recente projecten"
                message="Zodra u aan een project werkt, verschijnt het hier."
              />
            )}
          </div>
        </section>

        <section aria-labelledby="activity-title" className="lg:col-span-1">
          <h2 id="activity-title" className="text-xl font-semibold text-[#0F172A]">Activiteit</h2>
          <div className="mt-4 bg-white p-6 rounded-2xl shadow-sm">
            {activities.length > 0 ? (
              <ul className="space-y-6">
                {activities.map((activity, index) => (
                  <ActivityItem key={activity.id} activity={activity} isLast={index === activities.length - 1} />
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={<Rss className="h-12 w-12" />}
                title="Nog geen activiteit"
                message="Recente acties in uw projecten worden hier getoond."
              />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}