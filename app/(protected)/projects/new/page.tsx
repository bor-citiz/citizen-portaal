'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, LoaderCircle, CircleDot, AlertCircle, ArrowLeft } from 'lucide-react'

interface ProjectFormData {
  projectnaam: string
  locatie: string
  radius: string
  omschrijving_werkzaamheden: string
  globale_planning: string
  omleidingen_bereikbaarheidsissues: string
}

interface InputGroupProps {
  id: keyof ProjectFormData
  label: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  type?: string
  suffix?: string
}

const InputGroup: React.FC<InputGroupProps> = ({ 
  id, label, value, onChange, required = false, type = "text", placeholder, suffix 
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-[#0F172A] mb-1.5">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full h-11 px-4 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#23BFBF] focus:border-[#23BFBF] transition duration-200"
      />
      {suffix && (
        <span className="absolute inset-y-0 right-4 flex items-center text-[#64748B] text-sm">
          {suffix}
        </span>
      )}
    </div>
  </div>
)

interface TextareaGroupProps {
  id: keyof ProjectFormData
  label: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  rows?: number
}

const TextareaGroup: React.FC<TextareaGroupProps> = ({ 
  id, label, placeholder, value, onChange, rows = 4 
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-[#0F172A] mb-1.5">
      {label}
    </label>
    <textarea
      id={id}
      name={id}
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#23BFBF] focus:border-[#23BFBF] transition duration-200"
    />
  </div>
)

interface ProgressPanelProps {
  projectId: string
  onComplete: () => void
  onError: (error: string) => void
}

const ProgressPanel: React.FC<ProgressPanelProps> = ({ projectId, onComplete, onError }) => {
  const [timeElapsed, setTimeElapsed] = useState(0)

  useState(() => {
    // Time counter
    const timeTimer = setInterval(() => {
      setTimeElapsed(t => t + 1)
    }, 1000)

    // Poll for completion (every 30 seconds)
    const pollTimer = setInterval(async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/status`)
        const data = await response.json()
        
        if (data.status === 'completed') {
          clearInterval(pollTimer)
          setTimeout(onComplete, 1000)
        } else if (data.status === 'failed') {
          clearInterval(pollTimer)
          onError(data.error || 'Analysis failed')
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 30000)

    // Timeout after 12 minutes
    const timeoutTimer = setTimeout(() => {
      clearInterval(pollTimer)
      onError('Analysis timed out. Please try again or contact support.')
    }, 12 * 60 * 1000)

    return () => {
      clearInterval(timeTimer)
      clearInterval(pollTimer)
      clearTimeout(timeoutTimer)
    }
  })


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg ring-1 ring-black/5 w-full">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-[#23BFBF] to-[#5E79A5] rounded-full flex items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">☕</span>
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#23BFBF] rounded-full animate-pulse"></div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold text-[#0F172A] mb-3">Uw project wordt opgezet</h2>
          <p className="text-lg text-[#64748B] mb-2">Haal een kop koffie ☕</p>
          <p className="text-sm text-[#64748B]">
            Dit kan tot 30 minuten duren • Tijd verstreken: {formatTime(timeElapsed)}
          </p>
        </div>

        <div className="flex items-center justify-center space-x-2 text-[#5E79A5]">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Analyse loopt...</span>
        </div>
      </div>
    </div>
  )
}

export default function NewProjectPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProjectFormData>({
    projectnaam: '',
    locatie: '',
    radius: '',
    omschrijving_werkzaamheden: '',
    globale_planning: '',
    omleidingen_bereikbaarheidsissues: '',
  })

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleRadiusChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    if (/^\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, radius: value }))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Create initial project in database
      const response = await fetch('/api/projects/create-with-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          radius_meters: formData.radius ? parseInt(formData.radius) : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create project')
      }

      const { projectId: newProjectId } = await response.json()
      setProjectId(newProjectId)
      setIsSubmitting(false)
      setIsAnalyzing(true)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Er ging iets mis')
      setIsSubmitting(false)
    }
  }

  const handleAnalysisComplete = () => {
    router.push('/projects')
  }

  const handleAnalysisError = (errorMessage: string) => {
    setError(errorMessage)
    setIsAnalyzing(false)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
        <div className="h-1 w-full bg-gradient-to-r from-[#DB64B5] via-[#5E79A5] to-[#23BFBF]" />
        <main className="max-w-3xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <div className="bg-white p-8 rounded-2xl shadow-lg ring-1 ring-black/5 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#0F172A] mb-2">Er ging iets mis</h2>
            <p className="text-[#64748B] mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setError(null)} variant="outline">
                Opnieuw proberen
              </Button>
              <Button asChild>
                <Link href="/projects">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Terug naar projecten
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (isAnalyzing && projectId) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
        <div className="h-1 w-full bg-gradient-to-r from-[#DB64B5] via-[#5E79A5] to-[#23BFBF]" />
        <main className="max-w-3xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <ProgressPanel 
            projectId={projectId}
            onComplete={handleAnalysisComplete}
            onError={handleAnalysisError}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <div className="h-1 w-full bg-gradient-to-r from-[#DB64B5] via-[#5E79A5] to-[#23BFBF]" />
      
      <main className="max-w-3xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-[#0F172A]">Nieuw project</h1>
          <p className="text-base text-[#64748B] mt-2">
            Vul de onderstaande gegevens in om een nieuw project aan te maken.
          </p>
        </header>

        <div className="bg-white p-8 rounded-2xl shadow-lg ring-1 ring-black/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputGroup
              id="projectnaam"
              label="Projectnaam"
              placeholder="bv. Herinrichting Hoofdstraat"
              value={formData.projectnaam}
              onChange={handleChange}
              required
            />
            
            <InputGroup
              id="locatie"
              label="Locatie"
              placeholder="bv. Hoofdstraat, Amsterdam"
              value={formData.locatie}
              onChange={handleChange}
            />
            
            <InputGroup
              id="radius"
              label="Radius"
              type="text"
              value={formData.radius}
              onChange={handleRadiusChange}
              suffix="m"
              placeholder="500"
            />
            
            <TextareaGroup
              id="omschrijving_werkzaamheden"
              label="Omschrijving Werkzaamheden & Machines"
              placeholder="Beschrijf hier de werkzaamheden en welke machines er worden ingezet..."
              value={formData.omschrijving_werkzaamheden}
              onChange={handleChange}
            />
            
            <TextareaGroup
              id="globale_planning"
              label="Globale Planning & Werktijden"
              placeholder="Geef een indicatie van de planning en de werktijden..."
              value={formData.globale_planning}
              onChange={handleChange}
            />
            
            <TextareaGroup
              id="omleidingen_bereikbaarheidsissues"
              label="Omleidingen & Bereikbaarheidsissues"
              placeholder="Beschrijf eventuele omleidingen en problemen met de bereikbaarheid..."
              value={formData.omleidingen_bereikbaarheidsissues}
              onChange={handleChange}
            />
            
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/projects">Annuleren</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Project aanmaken...
                  </>
                ) : (
                  'Project aanmaken'
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}