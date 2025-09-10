import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase/service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const serviceSupabase = createServiceSupabase()
    const projectId = params.id

    const body = await request.json()
    const { status, error: errorMessage, result } = body

    // Validate required fields
    if (!status || !['active', 'draft', 'failed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: active, draft, or failed' }, 
        { status: 400 }
      )
    }

    // Verify project exists
    const { data: project, error: fetchError } = await serviceSupabase
      .from('projects')
      .select('id, status')
      .eq('id', projectId)
      .single()

    if (fetchError || !project) {
      return NextResponse.json(
        { error: 'Project not found' }, 
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    // Add error message if status is failed
    if (status === 'failed' && errorMessage) {
      updateData.error_message = errorMessage
    }

    // Add analysis result if status is active (success)
    if (status === 'active' && result) {
      updateData.analysis_result = result
    }

    // Update project status
    const { error: updateError } = await serviceSupabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update project status' }, 
        { status: 500 }
      )
    }

    console.log(`Project ${projectId} status updated to: ${status}`)

    return NextResponse.json({ 
      success: true,
      projectId,
      status,
      message: `Project status updated to ${status}`
    })

  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}