import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Send the user to login and then back to the dashboard after auth
    redirect(`/login?redirect=${encodeURIComponent('/dashboard')}`)
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (left) */}
      <aside className="w-64 shrink-0">
        <Sidebar />
      </aside>

      {/* Main column (right) */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}