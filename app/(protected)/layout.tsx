import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import LayoutClient from '../../components/LayoutClient'

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Send the user to login and then back to the dashboard after auth
    redirect(`/login?redirect=${encodeURIComponent('/dashboard')}`)
  }

  return (
    <LayoutClient userEmail={user.email}>
      {children}
    </LayoutClient>
  )
}