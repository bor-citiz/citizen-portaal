import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceSupabase } from '@/lib/supabase/service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = await params

    // Get project status using service role to bypass RLS issues
    const serviceSupabase = createServiceSupabase()
    const { data: project, error } = await serviceSupabase
      .from('projects')
      .select('status, created_at')
      .eq('id', projectId)
      .single()

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if analysis is complete (status changed from pending_analysis)
    if (project.status === 'active') {
      return NextResponse.json({ status: 'completed' })
    }

    // Check if analysis failed
    if (project.status === 'failed' || project.status === 'draft') {
      return NextResponse.json({ 
        status: 'failed', 
        error: project.status === 'draft' ? 'Analysis was reset to draft' : 'Analysis failed'
      })
    }

    // Check for timeout (more than 12 minutes)
    const createdAt = new Date(project.created_at)
    const now = new Date()
    const minutesElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60)

    if (minutesElapsed > 12) {
      // Update status to draft if timeout
      await serviceSupabase
        .from('projects')
        .update({ status: 'draft' })
        .eq('id', projectId)

      return NextResponse.json({ 
        status: 'failed', 
        error: 'Analysis timed out' 
      })
    }

    // Still pending
    return NextResponse.json({ status: 'pending' })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}