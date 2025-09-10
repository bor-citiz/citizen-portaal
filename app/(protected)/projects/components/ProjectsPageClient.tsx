'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { statusDisplayMap, statusStyles, type Project, type ProjectStatus } from '@/lib/types'
import { useDebounce } from '@/hooks/useDebounce'
import { Plus, Search, FolderOpen, ChevronDown, MapPin, Clock, Sparkles } from 'lucide-react'

interface ProjectsPageProps {
  projects: Project[]
}

const StatusChip: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  const displayStatus = statusDisplayMap[status] || status
  const styleClass = statusStyles[displayStatus] || 'bg-gray-100 text-gray-700 border-gray-200'
  
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-sm font-medium leading-tight ${styleClass}`}>
      {displayStatus}
    </span>
  )
}

const EmptyState: React.FC = () => (
  <div className="mt-16 text-center">
    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 border-2 border-dashed border-slate-300">
      <FolderOpen className="h-10 w-10 text-[#64748B]" aria-hidden="true" />
    </div>
    <h2 className="mt-6 text-xl font-semibold text-[#0F172A]">Nog geen projecten.</h2>
    <p className="mt-2 text-base text-[#64748B]">Begin met het organiseren van je werk.</p>
    <div className="mt-6">
      <Button asChild>
        <Link href="/projects/new">
          <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
          Maak je eerste project
        </Link>
      </Button>
    </div>
  </div>
)

const NoResultsState: React.FC<{ onClearFilters: () => void }> = ({ onClearFilters }) => (
  <div className="mt-16 text-center">
    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 border-2 border-dashed border-slate-300">
      <Search className="h-10 w-10 text-[#64748B]" aria-hidden="true" />
    </div>
    <h2 className="mt-6 text-xl font-semibold text-[#0F172A]">Geen projecten gevonden</h2>
    <p className="mt-2 text-base text-[#64748B]">Probeer je zoekterm of filters aan te passen.</p>
    <div className="mt-6">
      <button
        onClick={onClearFilters}
        className="text-[#23BFBF] hover:text-[#23BFBF]/80 font-medium"
      >
        Alle projecten tonen
      </button>
    </div>
  </div>
)

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
  <div className="flex flex-col bg-white p-6 rounded-2xl shadow-lg ring-1 ring-black/5 transition-all duration-150 ease-out hover:shadow-xl">
    <div className="flex-grow">
      <h3 className="text-base font-semibold text-[#0F172A]">{project.projectnaam}</h3>
      <p className="text-sm text-[#64748B] mt-1 flex items-center">
        <MapPin className="h-4 w-4 mr-1" />
        {project.locatie || 'Geen locatie opgegeven'}
      </p>
      <div className="mt-4">
        <StatusChip status={project.status} />
      </div>
    </div>
    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
      <p className="text-sm text-[#64748B]">
        Aangemaakt op {new Date(project.created_at).toLocaleDateString('nl-NL')}
      </p>
      <Button size="sm" asChild>
        <Link href={`/projects/${project.id}`}>
          Openen
        </Link>
      </Button>
    </div>
  </div>
)

export default function ProjectsPageClient({ projects }: ProjectsPageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('alle')
  const [sortOption, setSortOption] = useState<'nieuwste' | 'naam'>('nieuwste')

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Get unique statuses for filter dropdown
  const availableStatuses = useMemo(() => {
    const statuses = Array.from(new Set(projects.map(p => p.status)))
    return statuses.map(status => ({
      value: status,
      label: statusDisplayMap[status] || status
    }))
  }, [projects])

  const filteredAndSortedProjects = useMemo(() => {
    let result = projects

    // Filter by status
    if (statusFilter !== 'alle') {
      result = result.filter(p => p.status === statusFilter)
    }

    // Filter by search term
    if (debouncedSearchTerm) {
      result = result.filter(p =>
        p.projectnaam.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (p.locatie && p.locatie.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      )
    }

    // Sort
    if (sortOption === 'nieuwste') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortOption === 'naam') {
      result.sort((a, b) => a.projectnaam.localeCompare(b.projectnaam))
    }

    return result
  }, [projects, debouncedSearchTerm, statusFilter, sortOption])

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('alle')
  }

  const pendingAnalysisProjects = projects.filter(p => p.status === 'pending_analysis')

  return (
    <div className="space-y-8">
      {/* Brand Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-[#DB64B5] via-[#5E79A5] to-[#23BFBF] -mx-6"></div>

      {/* Notification Banner for Pending Analysis */}
      {pendingAnalysisProjects.length > 0 && (
        <div className="bg-gradient-to-r from-[#23BFBF]/10 to-[#5E79A5]/10 border border-[#23BFBF]/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="relative">
                <Sparkles className="h-5 w-5 text-[#23BFBF]" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#23BFBF] rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0F172A]">
                {pendingAnalysisProjects.length === 1 
                  ? 'Je project wordt momenteel opgezet...'
                  : `${pendingAnalysisProjects.length} projecten worden momenteel opgezet...`
                }
              </p>
              <p className="mt-1 text-sm text-[#64748B]">
                <Clock className="inline h-4 w-4 mr-1" />
                Dit kan tot 30 minuten duren. Je krijgt een melding wanneer het klaar is.
              </p>
              {pendingAnalysisProjects.length <= 3 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {pendingAnalysisProjects.map(project => (
                    <span key={project.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#23BFBF]/10 text-[#23BFBF] border border-[#23BFBF]/20">
                      {project.projectnaam}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-[#0F172A]">Projecten</h1>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Nieuw project
          </Link>
        </Button>
      </header>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative md:col-span-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-[#64748B]" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Zoek op projectnaam of locatie..."
            className="block w-full min-h-[44px] rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#23BFBF] transition-all duration-150 ease-out"
          />
        </div>
        
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full appearance-none min-h-[44px] rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#23BFBF] transition-all duration-150 ease-out"
          >
            <option value="alle">Alle statussen</option>
            {availableStatuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <ChevronDown className="h-4 w-4 text-[#64748B]" />
          </div>
        </div>

        <div className="relative">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as 'nieuwste' | 'naam')}
            className="block w-full appearance-none min-h-[44px] rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#23BFBF] transition-all duration-150 ease-out"
          >
            <option value="nieuwste">Sorteren op: Nieuwste</option>
            <option value="naam">Sorteren op: Naam</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <ChevronDown className="h-4 w-4 text-[#64748B]" />
          </div>
        </div>
      </div>

      {/* Filter Summary */}
      {(searchTerm || statusFilter !== 'alle') && (
        <div className="flex items-center gap-2 text-sm text-[#64748B]">
          <span>Filters actief:</span>
          {searchTerm && (
            <span className="bg-[#23BFBF]/10 text-[#23BFBF] px-2 py-1 rounded-md">
              Zoekterm: "{searchTerm}"
            </span>
          )}
          {statusFilter !== 'alle' && (
            <span className="bg-[#5E79A5]/10 text-[#5E79A5] px-2 py-1 rounded-md">
              Status: {availableStatuses.find(s => s.value === statusFilter)?.label}
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-[#DB64B5] hover:underline"
          >
            Wis filters
          </button>
        </div>
      )}
      
      {/* Content */}
      <div>
        {filteredAndSortedProjects.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#64748B]">
                {filteredAndSortedProjects.length} van {projects.length} projecten
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAndSortedProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </>
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <NoResultsState onClearFilters={clearFilters} />
        )}
      </div>
    </div>
  )
}