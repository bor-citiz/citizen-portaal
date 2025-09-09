import { createServerSupabase } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export default async function InstellingenPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  async function handleSignOut() {
    'use server'
    const supabase = await createServerSupabase()
    await supabase.auth.signOut()
  }

  return (
    <div className="p-6 font-sans">
      <div className="relative">
        <div className="absolute top-0 left-0 -ml-6 w-full h-1 bg-gradient-to-r from-[#DB64B5] via-[#5E79A5] to-[#23BFBF]" />
        <h1 className="text-3xl font-bold text-[#0F172A] pt-4">Instellingen</h1>
      </div>

      <div className="mt-8 space-y-8">
        <section className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-[#0F172A] mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#64748B]">E-mailadres</label>
              <p className="text-[#0F172A] mt-1">{user?.email || 'Geen e-mailadres beschikbaar'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#64748B]">Gebruikers ID</label>
              <p className="text-[#0F172A] mt-1 text-xs font-mono">{user?.id || 'Geen ID beschikbaar'}</p>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="text-xl font-semibold text-[#0F172A] mb-4">Acties</h2>
          <div className="space-y-4">
            <form action={handleSignOut}>
              <Button 
                type="submit" 
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                Uitloggen
              </Button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}