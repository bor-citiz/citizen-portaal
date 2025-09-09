'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Direct redirect to reset page
      redirectTo: `${location.origin}/auth/reset`,
    })

    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div
      className="min-h-screen grid place-items-center p-6"
      style={{ background: 'linear-gradient(135deg,#DB64B5 0%,#5E79A5 45%,#23BFBF 100%)' }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white/95 shadow-lg ring-1 ring-black/5 p-6">
        <h1 className="text-xl font-bold mb-2 text-slate-900">Wachtwoord vergeten</h1>

        {sent ? (
          <p className="text-sm text-green-700">
            Als het adres bestaat, hebben we een e-mail gestuurd met een link om je wachtwoord te resetten.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-slate-800">E-mail</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400"
                placeholder="jij@bedrijf.nl"
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 text-white px-3 py-2 text-sm hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? 'Versturen…' : 'Reset-link versturen'}
            </button>

            <div className="text-center">
              <Link href="/login" className="text-sm text-teal-700 hover:underline">
                Terug naar inloggen
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}