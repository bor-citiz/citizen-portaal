import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceSupabase } from '@/lib/supabase/service'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function POST(request: NextRequest) {
  try {
    // Use regular client for auth check
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role client for database operations to bypass RLS
    const serviceSupabase = createServiceSupabase()

    const body = await request.json()
    const {
      projectnaam,
      locatie,
      radius_meters,
      omschrijving_werkzaamheden,
      globale_planning
    } = body

    if (!projectnaam) {
      return NextResponse.json({ error: 'Projectnaam is verplicht' }, { status: 400 })
    }

    // Generate unique slug
    const base = slugify(projectnaam) || 'project'
    let slug = base

    for (let i = 0; i < 5; i++) {
      const { data: existing } = await serviceSupabase
        .from('projects')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()
      
      if (!existing) break
      slug = `${base}-${Math.floor(Math.random() * 999)}`
    }

    // Create project with 'pending_analysis' status
    const projectData = {
      projectnaam,
      locatie,
      radius_meters,
      omschrijving_werkzaamheden,
      globale_planning,
      status: 'pending_analysis',
      slug,
      created_by: user.id,
    }

    const { data: project, error: projectError } = await serviceSupabase
      .from('projects')
      .insert(projectData)
      .select('id')
      .single()

    if (projectError) {
      console.error('Database error:', projectError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // Add user as project member
    await serviceSupabase.from('project_users').insert({
      project_id: project.id,
      user_id: user.id,
    })

    // Send webhook to N8N with correct field names and projectId
    const webhookPayload = {
      projectId: project.id,
      projectnaam,
      locatie,
      radius: radius_meters,
      "omschrijving_werkzaamheden_ &_machines": omschrijving_werkzaamheden,
      "globale_planning _&_werktijden": globale_planning,
      user_id: user.id,
      user_email: user.email,
      created_at: new Date().toISOString()
    }

    console.log('Sending webhook to N8N:', webhookPayload)

    const webhookResponse = await fetch('https://citiz.app.n8n.cloud/webhook/c84487c7-10b4-400a-a022-14a2d2553825', {
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
      await serviceSupabase
        .from('projects')
        .update({ status: 'failed' }) // Mark as failed so coffee page can detect it
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