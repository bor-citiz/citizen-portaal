'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <Button variant="outline" onClick={handleSignOut}>
      Uitloggen
    </Button>
  )
}
