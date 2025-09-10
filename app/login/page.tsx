'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useSearchParams()
  const redirectTo = params.get('redirect') || '/dashboard'

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
        const { error: loginError } = await supabase.auth.signInWithPassword({ 
          email, 
          password: 'dummy-password'
        })
        
        if (loginError && loginError.message.includes('Invalid login credentials')) {
          setError('Dit e-mailadres is al geregistreerd. Probeer in te loggen of gebruik het wachtwoord vergeten formulier.')
          return
        }
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/confirm?next=/dashboard`
          }
        })
        
        if (error) throw error

        if (data.session) {
          router.replace(redirectTo)
          router.refresh()
        } else if (data.user) {
          setInfo('We hebben je een bevestigingsmail gestuurd. Klik op de link in die e-mail en log daarna in.')
          setMode('login')
        } else {
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#DB64B5] via-[#5E79A5] to-[#23BFBF]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image 
            src="/citiz-logo.png" 
            width={56} 
            height={56} 
            alt="Citizen Portaal" 
            className="h-14 w-auto"
            priority 
          />
        </div>

        {/* Title */}
        <h2 className="text-center text-3xl font-bold text-white mb-4">
          Inloggen Citizen Portaal
        </h2>
        
        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg ring-1 ring-black/5">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 pb-2 text-center text-sm font-semibold transition-colors ${
                mode === 'login' 
                  ? 'text-[#23BFBF] border-b-2 border-[#23BFBF]' 
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
              type="button"
            >
              Inloggen
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 pb-2 text-center text-sm font-semibold transition-colors ${
                mode === 'register' 
                  ? 'text-[#23BFBF] border-b-2 border-[#23BFBF]' 
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
              type="button"
            >
              Registreren
            </button>
          </div>

          {/* Alerts */}
          <div role="alert" aria-live="polite" className={`space-y-2 ${error || info ? 'mb-4' : 'mb-2'}`}>
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-md border border-[#23BFBF]/20 bg-[#23BFBF]/10 px-3 py-2 text-sm text-[#0F172A]">
                {info}
              </div>
            )}
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#0F172A]">
                E-mail
              </label>
              <input 
                type="email" 
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 shadow-sm placeholder-slate-400 focus:outline-none focus:border-[#23BFBF] focus:ring-2 focus:ring-[#23BFBF]"
                placeholder="jij@bedrijf.nl"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#0F172A]">
                Wachtwoord
              </label>
              <div className="relative">
                <input 
                  type={showPw ? "text" : "password"} 
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 shadow-sm placeholder-slate-400 focus:outline-none focus:border-[#23BFBF] focus:ring-2 focus:ring-[#23BFBF]"
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)} 
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#64748B] hover:text-[#0F172A]"
                  aria-label={showPw ? 'Verberg wachtwoord' : 'Toon wachtwoord'}
                >
                  {showPw ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243-4.243-4.243" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input 
                    id="remember-me" 
                    name="remember-me" 
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#23BFBF] focus:ring-[#23BFBF]" 
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-[#64748B]">
                    Onthoud mij
                  </label>
                </div>
                <div className="text-sm">
                  <Link href="/forgot-password" className="font-medium text-[#23BFBF] hover:text-[#23BFBF]/80">
                    Wachtwoord vergeten?
                  </Link>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#23BFBF] text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-[#23BFBF]/90 focus:outline-none focus:ring-2 focus:ring-[#23BFBF] focus:ring-offset-2 disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2"
            >
              {loading && Spinner}
              {mode === 'login' ? 'Inloggen' : 'Registreren'}
            </button>
          </form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-[#64748B]">of</span>
            </div>
          </div>
          
          <button
            onClick={handleMicrosoftLogin}
            className="w-full bg-white border border-slate-300 text-[#0F172A] py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#23BFBF] focus:ring-offset-2 transition-colors inline-flex items-center justify-center gap-2"
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

          <p className="mt-4 text-center text-xs text-[#64748B]">
            Door in te loggen ga je akkoord met onze voorwaarden.
          </p>
        </div>

        <footer className="text-center mt-8 text-sm text-white/80">
          © {new Date().getFullYear()} Citizen Portaal
        </footer>
      </div>
    </div>
  )
}