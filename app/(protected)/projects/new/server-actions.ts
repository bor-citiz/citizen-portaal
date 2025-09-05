'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function createProject(formData: FormData) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const projectnaam = String(formData.get('projectnaam') ?? '').trim()
  if (!projectnaam) throw new Error('Projectnaam is verplicht.')

  const locatie = String(formData.get('locatie') ?? '').trim() || null
  const radiusRaw = String(formData.get('radius_meters') ?? '').trim()
  const radius_meters = radiusRaw ? Number(radiusRaw) : null
  const omschrijving_werkzaamheden = String(formData.get('omschrijving_werkzaamheden') ?? '').trim() || null
  const globale_planning = String(formData.get('globale_planning') ?? '').trim() || null
  const omleidingen_bereikbaarheidsissues = String(formData.get('omleidingen_bereikbaarheidsissues') ?? '').trim() || null

  let base = slugify(projectnaam) || 'project'
  let slug = base

  for (let i = 0; i < 5; i++) {
    const { data: existing } = await supabase.from('projects').select('id').eq('slug', slug).maybeSingle()
    if (!existing) break
    slug = `${base}-${Math.floor(Math.random() * 999)}`
  }

  const { data: inserted, error } = await supabase
    .from('projects')
    .insert({
      projectnaam,
      locatie,
      radius_meters,
      omschrijving_werkzaamheden,
      globale_planning,
      omleidingen_bereikbaarheidsissues,
      status: 'draft',
      slug,
      created_by: user.id,         // <-- nieuw veld dat we net hebben toegevoegd
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  // jezelf admin-member maken in jouw bestaande tabel project_users
  await supabase.from('project_users').insert({
    project_id: inserted.id,
    user_id: user.id,
  })

  redirect('/projects')
}
