import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()

  const url = new URL(req.url)
  return NextResponse.redirect(new URL('/login', url.origin))
}
