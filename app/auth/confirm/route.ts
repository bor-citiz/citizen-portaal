import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

/**
 * Supabase confirmation handler - handles both formats:
 * 1. /auth/confirm?token_hash=...&type=signup&next=/projects
 * 2. /auth/confirm?confirmation_url=https://...supabase.co/auth/v1/verify?token=...&type=recovery&redirect_to=...
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  
  // Check for confirmation_url parameter (password reset flow)
  const confirmation_url = url.searchParams.get('confirmation_url')
  if (confirmation_url) {
    // Extract the actual Supabase verification URL and redirect to it
    return NextResponse.redirect(confirmation_url)
  }
  
  // Fallback to original token_hash flow (email confirmation)
  const token_hash = url.searchParams.get('token_hash')
  const type = (url.searchParams.get('type') || 'signup') as 'signup' | 'recovery' | 'email_change'
  const next = url.searchParams.get('next') || '/projects'

  if (!token_hash) {
    return NextResponse.redirect(new URL('/login?error=missing_token', url.origin))
  }

  const supabase = await createServerSupabase()
  const { error } = await supabase.auth.verifyOtp({ token_hash, type })
  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin))
  }

  // For password recovery, redirect to reset page instead of projects
  if (type === 'recovery') {
    return NextResponse.redirect(new URL('/auth/reset', url.origin))
  }
  
  // Na verificatie is er een sessiecookie gezet → door naar next
  return NextResponse.redirect(new URL(next, url.origin))
}
