'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { statusDisplayMap, statusStyles } from '@/lib/types'
import type { Project } from '@/lib/types'
import { 
  MoreHorizontal, 
  MapPin, 
  Calendar, 
  Settings, 
  CheckCircle2,
  Clock,
  Target,
  ArrowLeft
} from 'lucide-react'

interface ProjectDetailClientProps {
  project: Project
}

interface TabsProps {
  tabs: string[]
  activeTab: string
  onTabChange: (tab: string) => void
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === tab
                  ? 'border-[#23BFBF] text-[#23BFBF]'
                  : 'border-transparent text-[#64748B] hover:text-gray-700 hover:border-gray-300'
              }
            `}
            aria-current={activeTab === tab ? 'page' : undefined}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  )
}

interface CardProps {
  title: string
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

const Card: React.FC<CardProps> = ({ title, children, icon, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg ring-1 ring-black/5 ${className}`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          {icon}
          <h3 className="text-lg font-semibold text-[#0F172A]">{title}</h3>
        </div>
        <div className="text-sm text-[#64748B] leading-relaxed space-y-2">
          {children}
        </div>
      </div>
    </div>
  )
}

const StatusChip: React.FC<{ status: Project['status'] }> = ({ status }) => {
  const displayStatus = statusDisplayMap[status] || status
  const styleClass = statusStyles[displayStatus] || 'bg-gray-100 text-gray-700'
  
  return (
    <span className={`inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${styleClass}`}>
      {displayStatus}
    </span>
  )
}

export default function ProjectDetailClient({ project }: ProjectDetailClientProps) {
  const tabNames = ['Overzicht', 'Stakeholders', 'Kaart', 'Correspondentie', 'Bestanden']
  const [activeTab, setActiveTab] = useState(tabNames[0])

  const formattedDate = new Date(project.created_at).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Mock analysis result for now - replace with actual data when available
  const hasAnalysisResult = project.status === 'active'

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* Top Gradient Strip */}
      <div className="h-1 w-full bg-gradient-to-r from-[#DB64B5] via-[#5E79A5] to-[#23BFBF]"></div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="pt-6 pb-4">
          <Button variant="outline" asChild className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
            <Link href="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar projecten
            </Link>
          </Button>
        </div>

        {/* Sticky Sub-header */}
        <header className="sticky top-0 z-10 bg-[#F8FAFC]/80 backdrop-blur-lg pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-[#0F172A] truncate">{project.projectnaam}</h1>
              <StatusChip status={project.status} />
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="hidden sm:inline-flex border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                <Settings className="mr-2 h-4 w-4" />
                Instellingen
              </Button>
              <Button variant="outline" size="icon" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Meer acties</span>
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <Tabs tabs={tabNames} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        </header>

        {/* Page Content */}
        <div className="py-8">
          {activeTab === 'Overzicht' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                <Card title="Omschrijving Werkzaamheden">
                  <p>{project.omschrijving_werkzaamheden || 'Geen omschrijving beschikbaar.'}</p>
                </Card>
                <Card title="Globale Planning">
                  <p>{project.globale_planning || 'Geen planning beschikbaar.'}</p>
                </Card>
                {/* Future: Bereikbaarheid & Omleidingen card when database field is added */}
              </div>

              {/* Right Column (Sidebar) */}
              <div className="lg:col-span-1 space-y-8">
                <Card title="Basisgegevens" icon={<Settings className="w-5 h-5 text-[#5E79A5]" />}>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#64748B] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#0F172A]">Locatie</span>
                        <p>{project.locatie || 'Geen locatie opgegeven'}</p>
                      </div>
                    </li>
                    {project.radius_meters && (
                      <li className="flex items-start gap-3">
                        <Target className="w-5 h-5 text-[#64748B] flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-[#0F172A]">Radius</span>
                          <p>{project.radius_meters} meters</p>
                        </div>
                      </li>
                    )}
                    <li className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-[#64748B] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#0F172A]">Aangemaakt op</span>
                        <p>{formattedDate}</p>
                      </div>
                    </li>
                  </ul>
                </Card>
                
                <Card title="Analyse Status">
                  {hasAnalysisResult ? (
                    <div className="flex items-center gap-3 text-green-600">
                      <CheckCircle2 className="w-6 h-6 flex-shrink-0"/>
                      <div>
                        <p className="font-semibold">Analyse succesvol afgerond.</p>
                        <p className="text-xs text-[#64748B]">
                          Stakeholders geïdentificeerd.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-yellow-600">
                      <Clock className="w-6 h-6 flex-shrink-0"/>
                      <div>
                        <p className="font-semibold">Stakeholder analyse in behandeling.</p>
                        <p className="text-xs text-[#64748B]">Resultaten worden hier getoond zodra beschikbaar.</p>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}
          
          {/* Placeholder for other tabs */}
          {activeTab !== 'Overzicht' && (
            <div className="bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-8 text-center">
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{activeTab}</h3>
              <p className="text-[#64748B]">Deze functionaliteit is nog in ontwikkeling.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}