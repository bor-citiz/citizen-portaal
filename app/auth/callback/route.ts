import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const next = url.searchParams.get('next') || '/dashboard'
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  // Als Azure/Supabase een fout meegaf, toon hem duidelijk
  if (error) {
    const res = NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, url.origin))
    return res
  }

  // Als er geen code is, ga naar login
  if (!code) {
    return NextResponse.redirect(new URL('/login', url.origin))
  }

  // Wissel de code om voor een sessie en zet de cookies
  const supabase = await createServerSupabase()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError) {
    const res = NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, url.origin))
    return res
  }

  // Klaar → door naar de gewenste pagina
  return NextResponse.redirect(new URL(next, url.origin))
}
