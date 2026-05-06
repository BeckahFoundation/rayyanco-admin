import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import NewOrderForm from './NewOrderForm'

export default async function NewOrderPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price, sale_price, stock_quantity')
    .eq('is_active', true)
    .order('name')

  return (
    <AdminLayout>
      <div className="p-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">New Order</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <NewOrderForm products={products ?? []} />
        </div>
      </div>
    </AdminLayout>
  )
}
