import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id

    // Get project status
    const { data: project, error } = await supabase
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

    // Check for timeout (more than 12 minutes)
    const createdAt = new Date(project.created_at)
    const now = new Date()
    const minutesElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60)

    if (minutesElapsed > 12) {
      // Update status to draft if timeout
      await supabase
        .from('projects')
        .update({ status: 'draft' })
        .eq('id', projectId)

      return NextResponse.json({ 
        status: 'failed', 
        error: 'Analysis timed out' 
      })
    }

    return NextResponse.json({ status: 'pending' })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}