import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

// GET /auth/callback?code=...&next=/projects
export async function GET(req: Request) {
  const url = new URL(req.url)
  const next = url.searchParams.get('next') || '/projects'
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, url.origin))
  }
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', url.origin))
  }

  const supabase = await createServerSupabase()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, url.origin)
    )
  }

  return NextResponse.redirect(new URL(next, url.origin))
}
