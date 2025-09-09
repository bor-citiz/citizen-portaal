'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'register'

// Kleuren
const BRAND_SLATE = '#5E79A5'        // tab active + submit
const BRAND_SLATE_HOVER = '#516A90'  // hover van submit
const BRAND_BLUE  = '#6FA3DF'        // linkkleur (Wachtwoord vergeten)
const BRAND_BLUE_HOVER = '#5B92D6'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useSearchParams()
  const redirectTo = params.get('redirect') || '/projects'

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('srm_login_email')
    if (saved) setEmail(saved)
  }, [])

  const Spinner = useMemo(
    () => (
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"/>
      </svg>
    ),
    []
  )

  function saveRememberEmail(value: boolean, emailValue: string) {
    if (value && emailValue) localStorage.setItem('srm_login_email', emailValue)
    else localStorage.removeItem('srm_login_email')
  }

  async function handleMicrosoftLogin() {
    setError(null); setInfo(null)
    await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null); setInfo(null)
    try {
      saveRememberEmail(remember, email)
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.replace(redirectTo)
        router.refresh()
      } else {
        // REGISTREREN
        // Check if user exists by attempting login with dummy password
        const { error: loginError } = await supabase.auth.signInWithPassword({ 
          email, 
          password: 'dummy-password' // This will fail but tell us if user exists
        })
        
        // If we get a specific error about wrong password, user exists
        if (loginError && loginError.message.includes('Invalid login credentials')) {
          setError('Dit e-mailadres is al geregistreerd. Probeer in te loggen of gebruik het wachtwoord vergeten formulier.')
          return
        }
        
        // Proceed with signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/confirm?next=/projects`
          }
        })
        
        if (error) throw error

        if (data.session) {
          // Confirm email = OFF -> direct ingelogd
          router.replace(redirectTo)
          router.refresh()
        } else if (data.user) {
          // New user created - show confirmation message
          setInfo('We hebben je een bevestigingsmail gestuurd. Klik op de link in die e-mail en log daarna in.')
          setMode('login')
        } else {
          // Fallback for unexpected cases
          setError('Er ging iets mis bij de registratie. Probeer opnieuw.')
        }

      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg,#DB64B5 0%,#5E79A5 45%,#23BFBF 100%)' }}
    >
      <div className="w-full max-w-md">
        {/* Titel wisselt mee met tab */}
        <div className="mx-auto mb-8 flex flex-col items-center gap-3">
          <Image src="/citiz-logo.png" width={96} height={96} alt="Citizen Portaal" className="rounded" priority />
          <h1 className="text-white text-center text-3xl md:text-4xl font-extrabold drop-shadow-sm">
            {mode === 'login' ? 'Inloggen Citizen Portaal' : 'Registreren Citizen Portaal'}
          </h1>
        </div>

        <div className="rounded-2xl bg-white/95 shadow-lg ring-1 ring-black/5 backdrop-blur">
          {/* Tabs */}
          <div className="flex p-2 gap-2">
            <button
              className={`flex-1 rounded-lg px-3 py-2 text-sm ${
                mode === 'login' ? 'text-white' : 'text-slate-700 ring-1 ring-slate-200'
              }`}
              style={{ backgroundColor: mode === 'login' ? BRAND_SLATE : '#ffffff' }}
              onClick={() => setMode('login')}
              type="button"
            >
              Inloggen
            </button>
            <button
              className={`flex-1 rounded-lg px-3 py-2 text-sm ${
                mode === 'register' ? 'text-white' : 'text-slate-700 ring-1 ring-slate-200'
              }`}
              style={{ backgroundColor: mode === 'register' ? BRAND_SLATE : '#ffffff' }}
              onClick={() => setMode('register')}
              type="button"
            >
              Registreren
            </button>
          </div>

          <div className="px-6 pb-6">
            {/* Alerts */}
            <div role="alert" aria-live="polite" className="min-h-6 py-1 space-y-2">
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              {info && (
                <div
                  className="rounded-md px-3 py-2 text-sm"
                  style={{ border: `1px solid ${BRAND_SLATE}55`, backgroundColor: '#F8FAFC', color: '#0f172a' }}
                >
                  {info}
                </div>
              )}
            </div>

            {/* Form */}
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-slate-800">E-mail</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jij@bedrijf.nl"
                  autoComplete="email"
                  className="w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-2 outline-transparent focus:outline-teal-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="text-sm font-medium text-slate-800">Wachtwoord</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="w-full rounded-lg border px-3 py-2 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-2 outline-transparent focus:outline-teal-500"
                  />
                  <button
                    type="button"
                    aria-label={showPw ? 'Verberg wachtwoord' : 'Toon wachtwoord'}
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700"
                  >
                    {/* oog-icoon */}
                    {showPw ? (
                      <svg width="18" height="18" viewBox="0 0 24 24"><path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M10.58 10.58a3 3 0 104.24 4.24" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M9.88 5.08A10.94 10.94 0 0121 12s-2.5 4.5-9 4.5a10.94 10.94 0 01-3.12-.45" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M6.12 6.12A10.94 10.94 0 003 12s2.5 4.5 9 4.5" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border"
                  />
                  Onthoud mij
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm hover:underline"
                  style={{ color: BRAND_BLUE }}
                  onMouseOver={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = BRAND_BLUE_HOVER }}
                  onMouseOut={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = BRAND_BLUE }}
                >
                  Wachtwoord vergeten?
                </Link>
              </div>

              {/* Submit-knop: zelfde kleur als tab-switch */}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                style={{ backgroundColor: BRAND_SLATE }}
                onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = BRAND_SLATE_HOVER }}
                onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = BRAND_SLATE }}
              >
                {loading && Spinner}
                {mode === 'login' ? 'Inloggen' : 'Registreren'}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">of</span>
              </div>
            </div>

            <button
              onClick={handleMicrosoftLogin}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
              type="button"
            >
              <svg className="h-4 w-4" viewBox="0 0 23 23" aria-hidden="true">
                <rect width="10" height="10" x="1" y="1" fill="#f25022" />
                <rect width="10" height="10" x="12" y="1" fill="#7fba00" />
                <rect width="10" height="10" x="1" y="12" fill="#00a4ef" />
                <rect width="10" height="10" x="12" y="12" fill="#ffb900" />
              </svg>
              Inloggen met Microsoft
            </button>

            <p className="mt-4 text-center text-xs text-slate-500">
              Door in te loggen ga je akkoord met onze voorwaarden.
            </p>
          </div>
        </div>

        <footer className="mt-3 text-center text-white/90 text-xs">
          © {new Date().getFullYear()} Citizen Portaal
        </footer>
      </div>
    </div>
  )
}
