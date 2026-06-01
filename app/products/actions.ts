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
  return `HH-${rand}`
}

export async function upsertProduct(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string | null

  const num = (key: string, fallback: number) => {
    const n = Number(formData.get(key))
    return isFinite(n) ? n : fallback
  }
  const int = (key: string, fallback: number) => {
    const n = Math.floor(Number(formData.get(key)))
    return isFinite(n) ? n : fallback
  }

  const payload = {
    name: formData.get('name') as string,
    sku: (formData.get('sku') as string) || generateSKU(),
    description: (formData.get('description') as string) || null,
    cost: num('cost', 0),
    price: num('price', 0),
    sale_price: formData.get('sale_price') ? num('sale_price', 0) : null,
    category_id: (formData.get('category_id') as string) || null,
    stock_quantity: int('stock_quantity', 0),
    low_stock_threshold: int('low_stock_threshold', 5),
    price_on_request: formData.get('price_on_request') === 'true',
    is_active: formData.get('is_active') === 'true',
    image_url: (formData.get('image_url') as string) || null,
    image_urls: JSON.parse((formData.get('image_urls') as string) || '[]'),
  }

  if (id) {
    await supabase.from('products').update(payload).eq('id', id)
  } else {
    await supabase.from('products').insert(payload)
  }

  revalidatePath('/products')
  redirect('/products')
}
