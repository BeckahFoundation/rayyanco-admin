'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateStock(formData: FormData) {
  const id = formData.get('id') as string
  const stock_quantity = parseInt(formData.get('stock_quantity') as string)
  const supabase = await createClient()
  await supabase.from('products').update({ stock_quantity }).eq('id', id)
  revalidatePath('/inventory')
  revalidatePath('/products')
  revalidatePath('/dashboard')
}
