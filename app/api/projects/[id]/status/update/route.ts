import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase } from '@/lib/supabase/service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const serviceSupabase = createServiceSupabase()
    const { id: projectId } = await params

    const body = await request.json()
    console.log('Status update request body:', body)
    
    // Handle N8N's actual format vs expected format
    let status: string
    let errorMessage: string | undefined
    let result: any

    if (body.status) {
      // Expected format: { status: "active", result: {...} }
      status = body.status
      errorMessage = body.error
      result = body.result
    } else if (body.analysis_complete === true) {
      // N8N success format: { analysis_complete: true, stakeholders: "..." }
      status = 'active'
      result = {
        stakeholders: body.stakeholders,
        analysis_complete: body.analysis_complete,
        projectId: body.projectId
      }
    } else if (body.error || body.failed === true) {
      // N8N error format
      status = 'failed'
      errorMessage = body.error || 'N8N workflow failed'
    } else {
      // Unknown format
      console.log('Unknown request format:', body)
      return NextResponse.json(
        { 
          error: 'Invalid request format. Expected status field or analysis_complete field',
          received: Object.keys(body),
          validFormats: [
            '{ "status": "active|draft|failed" }',
            '{ "analysis_complete": true, "stakeholders": "..." }',
            '{ "error": "error message" }'
          ]
        }, 
        { status: 400 }
      )
    }

    // Final validation
    if (!['active', 'draft', 'failed'].includes(status)) {
      return NextResponse.json(
        { 
          error: 'Invalid status. Must be: active, draft, or failed',
          received: status
        }, 
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
      status
    }

    // Skip error message for now - column might not exist
    // if (status === 'failed' && errorMessage) {
    //   updateData.error_message = errorMessage
    // }

    // Skip storing analysis result for now - column doesn't exist yet
    // if (status === 'active' && result) {
    //   updateData.analysis_result = result
    // }

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