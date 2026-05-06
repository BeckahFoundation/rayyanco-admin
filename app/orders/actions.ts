'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateOrderStatus(formData: FormData) {
  const id = formData.get('id') as string
  const status = formData.get('status') as string
  const supabase = await createClient()
  await supabase.from('orders').update({ status }).eq('id', id)
  revalidatePath('/orders')
  revalidatePath(`/orders/${id}`)
}

export async function createOrder(formData: FormData) {
  const supabase = await createClient()

  const itemsJson = formData.get('items') as string
  const items: { product_id: string; product_name: string; quantity: number; unit_price: number }[] = JSON.parse(itemsJson)

  const total = items.reduce((s, i) => s + i.quantity * i.unit_price, 0)

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      customer_name: formData.get('customer_name') as string,
      customer_email: (formData.get('customer_email') as string) || null,
      customer_phone: (formData.get('customer_phone') as string) || null,
      notes: (formData.get('notes') as string) || null,
      status: 'pending',
      total_amount: total,
    })
    .select()
    .single()

  if (error || !order) throw new Error(error?.message ?? 'Failed to create order')

  await supabase.from('order_items').insert(
    items.map(i => ({ order_id: order.id, ...i }))
  )

  revalidatePath('/orders')
  redirect('/orders')
}

export async function deleteOrder(formData: FormData) {
  const id = formData.get('id') as string
  const supabase = await createClient()
  await supabase.from('orders').delete().eq('id', id)
  revalidatePath('/orders')
}
