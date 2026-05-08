import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import ProductForm from '../ProductForm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart } from 'lucide-react'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('name'),
  ])

  if (!product) notFound()

  const { data: rawItems } = await supabase
    .from('order_items')
    .select('id, quantity, unit_price, order_id')
    .eq('product_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  const orderIds = (rawItems ?? []).map((i: any) => i.order_id).filter(Boolean)
  const { data: orders } = orderIds.length
    ? await supabase.from('orders').select('id, order_number, status, created_at, customer_name').in('id', orderIds)
    : { data: [] }

  const ordersMap: Record<string, any> = {}
  for (const o of orders ?? []) ordersMap[o.id] = o

  const orderItems = (rawItems ?? []).map((i: any) => ({ ...i, order: ordersMap[i.order_id] ?? null }))
  const totalUnits = orderItems.reduce((s, i: any) => s + i.quantity, 0)
  const totalRevenue = orderItems.reduce((s, i: any) => s + i.quantity * i.unit_price, 0)

  return (
    <AdminLayout>
      <div className="p-8 max-w-5xl">
        <Link href="/products" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft size={15} /> Back to Products
        </Link>

        <div className="flex items-start gap-4 mb-8">
          {product.image_url && (
            <img src={product.image_url} alt={product.name} className="w-20 h-20 rounded-xl object-cover border border-gray-100" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{product.sku}</p>
          </div>
          <div className="ml-auto flex gap-4">
            <div className="text-center px-4 py-2 bg-orange-50 rounded-xl">
              <div className="text-xl font-bold text-orange-600">{totalUnits}</div>
              <div className="text-xs text-gray-500 mt-0.5">Units Sold</div>
            </div>
            <div className="text-center px-4 py-2 bg-green-50 rounded-xl">
              <div className="text-xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
              <div className="text-xs text-gray-500 mt-0.5">Revenue</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Edit Product</h2>
              <ProductForm product={product} categories={categories ?? []} />
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingCart size={16} className="text-gray-400" /> Order History
              </h2>
              {orderItems.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {orderItems.map((item: any) => {
                    const order = item.order
                    return (
                    <div key={item.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={`/orders/${order?.id ?? ''}`} className="text-sm font-medium text-orange-600 hover:underline">
                            #{order?.order_number ?? '—'}
                          </Link>
                          <p className="text-xs text-gray-500 mt-0.5">{order?.customer_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">×{item.quantity}</p>
                          <p className="text-xs text-gray-400">${Number(item.unit_price).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          order?.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order?.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                          'bg-orange-100 text-orange-700'
                        }`}>{order?.status ?? '—'}</span>
                        <span className="text-xs text-gray-400">{order?.created_at ? new Date(order.created_at).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
