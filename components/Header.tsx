import { createServerSupabase } from '@/lib/supabase/server'

export default async function Header() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Breadcrumb/Page context - could be expanded later */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span>Citizen Portaal</span>
      </div>

      {/* User info */}
      <div className="flex items-center space-x-3">
        {user && (
          <div className="text-sm text-gray-700">
            {user.email}
          </div>
        )}
        {/* Future: Add user menu dropdown here */}
      </div>
    </header>
  );
}