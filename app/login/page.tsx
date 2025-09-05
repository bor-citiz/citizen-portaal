'use client'

import { useState, SVGProps } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Microsoft logo svg (zoals je had)
function MicrosoftLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M1 1H9.5V9.5H1V1Z" fill="#F25022" />
      <path d="M11.5 1H20V9.5H11.5V1Z" fill="#7FBA00" />
      <path d="M1 11.5H9.5V20H1V11.5Z" fill="#00A4EF" />
      <path d="M11.5 11.5H20V20H11.5V11.5Z" fill="#FFB900" />
    </svg>
  )
}

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const redirectTo = params.get('redirect') || '/dashboard'

  async function handleMicrosoftLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}` },
    })
  }

  async function handleEmailPassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      // Probeer direct in te loggen
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
      if (signInErr) {
        // Als gebruiker niet bestaat: aanmaken en dan inloggen
        const { error: signUpErr } = await supabase.auth.signUp({ email, password })
        if (signUpErr) throw signUpErr
        const { error: signInErr2 } = await supabase.auth.signInWithPassword({ email, password })
        if (signInErr2) throw signInErr2
      }
      router.replace(redirectTo)
      router.refresh()
    } catch (err: any) {
      setError(err?.message ?? 'Er is iets misgegaan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-semibold">Citizen Portaal</h1>
          <p className="text-sm text-gray-500">Log in om je projecten te bekijken</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* E-mail/wachtwoord */}
          <form onSubmit={handleEmailPassword} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring"
                placeholder="jij@voorbeeld.nl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Wachtwoord</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Bezig…' : 'Inloggen / Registreren'}
            </Button>
          </form>

          {/* scheiding */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="h-px flex-1 bg-gray-200" />
            OF
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Microsoft OAuth */}
          <Button onClick={handleMicrosoftLogin} className="w-full bg-accent hover:bg-accent/90">
            <MicrosoftLogo className="mr-2 h-4 w-4" />
            Inloggen met Microsoft
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
