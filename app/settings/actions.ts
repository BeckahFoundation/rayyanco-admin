'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveSettings(formData: FormData) {
  const supabase = await createClient()
  const entries = [
    { key: 'contact_email', value: formData.get('contact_email') as string },
    { key: 'contact_phone', value: formData.get('contact_phone') as string },
    { key: 'company_name', value: formData.get('company_name') as string },
    { key: 'company_tagline', value: formData.get('company_tagline') as string },
  ]
  for (const entry of entries) {
    await supabase.from('settings').upsert(entry, { onConflict: 'key' })
  }
  revalidatePath('/')
  revalidatePath('/settings')
}
