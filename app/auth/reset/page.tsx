'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Stage = 'checking' | 'ready' | 'saving' | 'done' | 'error'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useSearchParams()

  const [stage, setStage] = useState<Stage>('checking')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      // Check for error in URL
      const urlError = params.get('error_description')
      if (urlError) {
        setMessage(decodeURIComponent(urlError))
        setStage('error')
        return
      }

      // Check for access_token and refresh_token in URL (password reset flow)
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const token = params.get('token')
      const type = params.get('type')
      
      // Try to handle session from URL parameters
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })
        
        if (error) {
          setMessage(error.message)
          setStage('error')
          return
        }
        
        setStage('ready')
        return
      }
      
      // Alternative: check if there's a single token and type=recovery
      if (token && type === 'recovery') {
        try {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery'
          })
          
          if (error) {
            setMessage(error.message)
            setStage('error')
            return
          }
          
          if (data.session) {
            setStage('ready')
            return
          }
        } catch (err) {
          setMessage((err as Error).message)
          setStage('error')
          return
        }
      }

      // Check if we already have an active session (user came via callback)
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        setMessage(error.message)
        setStage('error')
        return
      }

      if (session) {
        setStage('ready')
      } else {
        setMessage('Invalid or expired reset link. Please request a new one.')
        setStage('error')
      }
    })()
  }, [params, supabase])

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

  const isSaving = stage === 'saving'
  const buttonText = isSaving ? 'Opslaan…' : 'Opslaan'
  const isDisabled = isSaving

  return (
    <div
      className="min-h-screen grid place-items-center p-6"
      style={{ background: 'linear-gradient(135deg,#DB64B5 0%,#5E79A5 45%,#23BFBF 100%)' }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white/95 shadow-lg ring-1 ring-black/5 p-6">
        <h1 className="text-xl font-bold mb-2 text-slate-900">Nieuw wachtwoord instellen</h1>

        {stage === 'checking' && (
          <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Bezig met valideren…
          </div>
        )}

        {stage === 'error' && (
          <>
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {message || 'Reset link is ongeldig of verlopen'}
            </div>
            <button 
              onClick={() => router.push('/forgot-password')} 
              className="text-sm underline text-teal-700 hover:text-teal-800"
            >
              Nieuwe reset-link aanvragen
            </button>
          </>
        )}

        {(stage === 'ready' || stage === 'saving') && (
          <form onSubmit={onSubmit} className="space-y-3">
            {message && (
              <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {message}
              </div>
            )}
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

            <button
              type="submit"
              disabled={isDisabled}
              className="w-full rounded-lg bg-slate-900 text-white px-3 py-2 text-sm hover:bg-slate-800 disabled:opacity-60"
            >
              {buttonText}
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