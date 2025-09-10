import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      projectnaam,
      locatie,
      radius_meters,
      omschrijving_werkzaamheden,
      globale_planning,
      omleidingen_bereikbaarheidsissues
    } = body

    if (!projectnaam) {
      return NextResponse.json({ error: 'Projectnaam is verplicht' }, { status: 400 })
    }

    // Generate unique slug
    const base = slugify(projectnaam) || 'project'
    let slug = base

    for (let i = 0; i < 5; i++) {
      const { data: existing } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()
      
      if (!existing) break
      slug = `${base}-${Math.floor(Math.random() * 999)}`
    }

    // Create project with 'pending_analysis' status
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        projectnaam,
        locatie,
        radius_meters,
        omschrijving_werkzaamheden,
        globale_planning,
        omleidingen_bereikbaarheidsissues,
        status: 'pending_analysis',
        slug,
        created_by: user.id,
      })
      .select('id')
      .single()

    if (projectError) {
      console.error('Database error:', projectError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Add user as project member
    await supabase.from('project_users').insert({
      project_id: project.id,
      user_id: user.id,
    })

    // Send webhook to N8N
    const webhookPayload = {
      projectId: project.id,
      projectnaam,
      locatie,
      radius_meters,
      omschrijving_werkzaamheden,
      globale_planning,
      omleidingen_bereikbaarheidsissues,
      user_id: user.id,
      user_email: user.email,
      created_at: new Date().toISOString()
    }

    console.log('Sending webhook to N8N:', webhookPayload)

    const webhookResponse = await fetch('https://citiz.app.n8n.cloud/webhook/c91e7b48-01ba-4855-aa01-b0ac2959b050', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Citizen-Portaal/1.0'
      },
      body: JSON.stringify(webhookPayload)
    })

    if (!webhookResponse.ok) {
      console.error('Webhook failed:', webhookResponse.status, await webhookResponse.text())
      // Don't fail the entire request - the project is created, analysis just failed
      await supabase
        .from('projects')
        .update({ status: 'draft' }) // Fallback to draft status
        .eq('id', project.id)
    } else {
      console.log('Webhook sent successfully')
    }

    return NextResponse.json({ projectId: project.id })

  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}