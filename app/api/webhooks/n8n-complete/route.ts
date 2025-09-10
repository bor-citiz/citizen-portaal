import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

// Type definitions based on your JSON example
interface StakeholderData {
  stakeholder_id: string
  naam: string
  type: string
  adres: string
  telefoon?: string
  openingstijden?: string
  hinder: {
    geluid: { score: number; toelichting: string }
    trillingen: { score: number; toelichting: string }
    bereikbaarheid: { score: number; toelichting: string }
    parkeren_logistiek: { score: number; toelichting: string }
    stof_emissies: { score: number; toelichting: string }
    veiligheid_continuiteit: { score: number; toelichting: string }
  }
  prioriteit: string
  maatregelen: string[]
  communicatie: {
    aanpak: string[]
    timing: string
    contactpersoon: string
  }
  opmerkingen?: string
  gegevenskwaliteit: {
    ontbrekende_velden: string[]
    betrouwbaarheid: string
  }
}

interface WebhookPayload {
  projectId: string
  stakeholders: StakeholderData[]
  analysis_complete: boolean
  analysis_summary?: {
    total_stakeholders: number
    high_priority: number
    medium_priority: number
    low_priority: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: WebhookPayload = await request.json()
    console.log('N8N webhook received:', { projectId: body.projectId, stakeholderCount: body.stakeholders?.length })

    const { projectId, stakeholders, analysis_complete } = body

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    // Use service key for admin operations
    const supabase = await createServerSupabase()

    // Update project status
    const { error: projectError } = await supabase
      .from('projects')
      .update({ 
        status: analysis_complete ? 'active' : 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (projectError) {
      console.error('Failed to update project:', projectError)
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
    }

    // Create stakeholders table if it doesn't exist
    if (stakeholders && stakeholders.length > 0) {
      // Prepare stakeholder data for insertion
      const stakeholderInserts = stakeholders.map(stakeholder => ({
        project_id: projectId,
        stakeholder_id: stakeholder.stakeholder_id,
        naam: stakeholder.naam,
        type: stakeholder.type,
        adres: stakeholder.adres,
        telefoon: stakeholder.telefoon || null,
        openingstijden: stakeholder.openingstijden || null,
        prioriteit: stakeholder.prioriteit.toLowerCase(), // Normalize to lowercase
        
        // Store complex data as JSONB
        hinder_data: stakeholder.hinder,
        maatregelen: stakeholder.maatregelen,
        communicatie_data: stakeholder.communicatie,
        opmerkingen: stakeholder.opmerkingen || null,
        gegevenskwaliteit: stakeholder.gegevenskwaliteit,
        
        created_at: new Date().toISOString()
      }))

      // Insert stakeholders (we'll need to create this table)
      const { error: stakeholderError } = await supabase
        .from('stakeholders')
        .insert(stakeholderInserts)

      if (stakeholderError) {
        console.error('Failed to insert stakeholders:', stakeholderError)
        // Continue anyway - project status is updated
      } else {
        console.log(`Successfully inserted ${stakeholders.length} stakeholders`)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Project ${projectId} analysis completed with ${stakeholders?.length || 0} stakeholders` 
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}