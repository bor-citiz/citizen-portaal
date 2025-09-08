'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

function MicrosoftLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 23 23" aria-hidden="true" {...props}>
      <rect width="10" height="10" x="1" y="1" fill="#f25022" />
      <rect width="10" height="10" x="12" y="1" fill="#7fba00" />
      <rect width="10" height="10" x="1" y="12" fill="#00a4ef" />
      <rect width="10" height="10" x="12" y="12" fill="#ffb900" />
    </svg>
  )
}

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useSearchParams()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const redirectTo = params.get('redirect') || '/projects'

  async function handleMicrosoftLogin() {
    setError(null)
    await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    })
  }

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setError(null)
  setLoading(true)

  try {
    if (mode === 'login') {
      // — INLOGGEN —
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
      if (signInErr) {
        setError(`Inloggen mislukt: ${signInErr.message}`)
        setLoading(false)
        return
      }
      router.replace(redirectTo)
      router.refresh()
      return
    }

    // — REGISTREREN —
    const { data, error: signUpErr } = await supabase.auth.signUp({ email, password })

    // Toon exact wat Supabase teruggeeft (helpt bij debuggen)
    console.log('signUp data:', data)
    console.log('signUp error:', signUpErr)

    if (signUpErr) {
      setError(`Registreren mislukt: ${signUpErr.message}`)
      setLoading(false)
      return
    }

    // Als “Confirm email” AAN staat, is er géén sessie: blijf op de pagina en toon melding
    if (!data.session) {
      setError('Registratie gelukt. Controleer je e-mail om te bevestigen.')
      setLoading(false)
      return
    }

    // Bij “Confirm email” UIT krijg je direct een sessie en kun je door
    router.replace(redirectTo)
    router.refresh()
    return
  } catch (err: any) {
    setError(err?.message ?? 'Er ging iets mis.')
  } finally {
    setLoading(false)
  }
}


  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-sm bg-white shadow-sm rounded-xl">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Citizen Portaal</h1>
          <p className="text-sm text-gray-600">Log in om je projecten te bekijken</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm" role="tablist" aria-label="Login modus">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => setMode('login')}
              className={`px-3 py-1 rounded ${mode==='login' ? 'bg-black text-white' : 'bg-gray-200'}`}
            >
              Inloggen
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => setMode('register')}
              className={`px-3 py-1 rounded ${mode==='register' ? 'bg-black text-white' : 'bg-gray-200'}`}
            >
              Registreren
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring"
                placeholder="jij@voorbeeld.nl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="password">Wachtwoord</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Bezig…' : mode === 'login' ? 'Inloggen' : 'Registreren'}
            </Button>
          </form>

          <div className="flex items-center gap-2 text-xs text-gray-400" aria-hidden>
            <div className="h-px flex-1 bg-gray-200" />
            OF
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <Button
            onClick={handleMicrosoftLogin}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center gap-2"
            aria-label="Inloggen met Microsoft"
          >
            <MicrosoftLogo className="h-4 w-4" />
            Inloggen met Microsoft
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
