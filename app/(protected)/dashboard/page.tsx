// app/(protected)/dashboard/page.tsx
import { createServerSupabase } from '@/lib/supabase/server'
import SignOutButton from './signout-button'

export default async function DashboardPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-sm text-gray-500">
        {user?.email ? `Welkom, ${user.email}` : 'Welkom bij je Citizen Portaal.'}
      </p>
      <SignOutButton />
    </section>
  )
}
