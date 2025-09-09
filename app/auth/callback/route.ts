import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'
  
  // Check if this is a password reset flow
  const type = requestUrl.searchParams.get('type')

  // Debug logging
  console.log('Callback route hit:', {
    url: requestUrl.href,
    code: !!code,
    type,
    next
  })

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value: '', ...options, maxAge: 0 })
          },
        },
      }
    )
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('Session exchange result:', { error: error?.message })
    
    if (!error) {
      // If this is a password reset, redirect to the reset page
      if (type === 'recovery') {
        console.log('Redirecting to reset page for password recovery')
        return NextResponse.redirect(new URL('/auth/reset', requestUrl.origin))
      }
    }
  }

  console.log('Redirecting to:', next)
  return NextResponse.redirect(new URL(next, requestUrl.origin))
}