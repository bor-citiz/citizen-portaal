import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

/**
 * Supabase stuurt een link zoals:
 * /auth/confirm?token_hash=...&type=signup&next=/projects
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
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

  // Na verificatie is er een sessiecookie gezet → door naar next
  return NextResponse.redirect(new URL(next, url.origin))
}
