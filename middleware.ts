// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Publieke routes (geen auth nodig)
const PUBLIC_ROUTES = ['/login', '/auth/callback', '/auth/confirm'] // voeg /auth/confirm toe als je email confirmations gebruikt

export async function middleware(req: NextRequest) {
  // Belangrijk: dit 'res' gebruiken we als cookie-bridge
  const res = NextResponse.next({
    request: { headers: req.headers },
  })

  // Moderne cookie-API in middleware: getAll/setAll (vereist door @supabase/ssr)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            res.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  // Gebruik getUser() in middleware voor betrouwbare revalidatie
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname, search } = req.nextUrl
  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r))

  // Niet ingelogd en route is niet publiek -> redirect naar /login met redirect-param
  if (!user && !isPublic) {
    const to = req.nextUrl.clone()
    to.pathname = '/login'
    to.searchParams.set('redirect', pathname + (search || ''))
    const redirectRes = NextResponse.redirect(to)
    // Cookies van 'res' kopiëren naar de redirect-respons
    for (const { name, value, ...rest } of res.cookies.getAll()) {
      redirectRes.cookies.set({ name, value, ...rest })
    }
    return redirectRes
  }

  // Al ingelogd en toch naar /login -> door naar startpagina
  if (user && pathname === '/login') {
    const to = req.nextUrl.clone()
    to.pathname = '/projects' // of '/dashboard' als je dat verkiest
    const redirectRes = NextResponse.redirect(to)
    for (const { name, value, ...rest } of res.cookies.getAll()) {
      redirectRes.cookies.set({ name, value, ...rest })
    }
    return redirectRes
  }

  // Altijd hetzelfde 'res' teruggeven, waar @supabase/ssr de cookies op heeft gezet
  return res
}

export const config = {
  matcher: [
    // Alles behalve statics/images etc.
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images/|public/|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)',
  ],
}
