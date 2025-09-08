'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Stage = 'gate' | 'checking' | 'ready' | 'saving' | 'done' | 'error'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useSearchParams()

  const [stage, setStage] = useState<Stage>('checking')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  // Toon foutmelding uit URL (bijv. otp_expired)
  useEffect(() => {
    const urlErr = params.get('error_description')
    if (urlErr) {
      setMessage(decodeURIComponent(urlErr))
      setStage('error')
    }
  }, [params])

  // Setup: gate voor ?code=..., anders luister naar recovery/hash of bestaande sessie
  useEffect(() => {
    if (stage !== 'checking') return

    const code = params.get('code')
    if (code) {
      setStage('gate')
      return
    }

    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setStage('ready')
        return
      }
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY' && session) setStage('ready')
      })
      const t = setTimeout(async () => {
        const { data } = await supabase.auth.getSession()
        setStage(data.session ? 'ready' : 'error')
      }, 1500)
      return () => {
        clearTimeout(t)
        sub.subscription.unsubscribe()
      }
    })()
  }, [stage, params, supabase])

  async function proceed() {
    const code = params.get('code')
    if (!code) return
    setStage('checking')
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      setMessage(error.message)
      setStage('error')
      return
    }
    setStage('ready')
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (stage !== 'ready') return

    setStage('saving')
    setMessage(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setMessage(error.message)
      setStage('ready')
      return
    }
    setStage('done')
    setTimeout(() => router.replace('/login'), 1200)
  }

  function resendLink() {
    router.push('/forgot-password')
  }

  return (
    <div
      className="min-h-screen grid place-items-center p-6"
      style={{ background: 'linear-gradient(135deg,#DB64B5 0%,#5E79A5 45%,#23BFBF 100%)' }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white/95 shadow-lg ring-1 ring-black/5 p-6">
        <h1 className="text-xl font-bold mb-2 text-slate-900">Nieuw wachtwoord instellen</h1>

        {stage === 'gate' && (
          <>
            <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
              Beveiligingscontrole: klik op “Ga verder” om je resetlink te bevestigen.
            </div>
            <button
              onClick={proceed}
              className="w-full rounded-lg bg-slate-900 text-white px-3 py-2 text-sm hover:bg-slate-800"
            >
              Ga verder
            </button>
          </>
        )}

        {stage === 'checking' && (
          <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Bezig met valideren…
          </div>
        )}

        {stage === 'error' && (
          <>
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {message || 'Email link is invalid or has expired'}
            </div>
            <button onClick={resendLink} className="text-sm underline text-teal-700 hover:text-teal-800">
              Nieuwe reset-link sturen
            </button>
          </>
        )}

        {stage === 'ready' && (
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="pw" className="text-sm font-medium text-slate-800">Nieuw wachtwoord</label>
              <input
                id="pw"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            {/* >>> hier zat je TS-fout; zo is het veilig en simpel */}
            <button
              type="submit"
              disabled={stage !== 'ready'}
              className="w-full rounded-lg bg-slate-900 text-white px-3 py-2 text-sm hover:bg-slate-800 disabled:opacity-60"
            >
              {stage !== 'ready' ? 'Opslaan…' : 'Opslaan'}
            </button>
          </form>
        )}

        {stage === 'done' && (
          <p className="text-sm text-green-700">Wachtwoord gewijzigd. Je wordt doorgestuurd…</p>
        )}
      </div>
    </div>
  )
}
