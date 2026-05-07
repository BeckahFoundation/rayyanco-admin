'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteProduct(formData: FormData) {
  const id = formData.get('id') as string
  const supabase = await createClient()
  await supabase.from('products').delete().eq('id', id)
  revalidatePath('/products')
}

function generateSKU(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const rand = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `RYC-${rand}`
}

export async function upsertProduct(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string | null

  const payload = {
    name: formData.get('name') as string,
    sku: (formData.get('sku') as string) || generateSKU(),
    description: (formData.get('description') as string) || null,
    cost: parseFloat(formData.get('cost') as string) || 0,
    price: parseFloat(formData.get('price') as string) || 0,
    sale_price: formData.get('sale_price') ? parseFloat(formData.get('sale_price') as string) : null,
    category_id: (formData.get('category_id') as string) || null,
    stock_quantity: parseInt(formData.get('stock_quantity') as string) || 0,
    low_stock_threshold: parseInt(formData.get('low_stock_threshold') as string) || 5,
    is_active: formData.get('is_active') === 'true',
    image_url: (formData.get('image_url') as string) || null,
  }

  if (id) {
    await supabase.from('products').update(payload).eq('id', id)
  } else {
    await supabase.from('products').insert(payload)
  }

  revalidatePath('/products')
  redirect('/products')
}
