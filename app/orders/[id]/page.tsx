import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { updateOrderStatus } from '../actions'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: order } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, image_url))')
    .eq('id', id)
    .single()

  if (!order) notFound()

  return (
    <AdminLayout>
      <div className="p-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/orders" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Customer</h2>
            <p className="font-semibold text-gray-900">{order.customer_name}</p>
            {order.customer_email && <p className="text-sm text-gray-500">{order.customer_email}</p>}
            {order.customer_phone && <p className="text-sm text-gray-500">{order.customer_phone}</p>}
            {order.notes && <p className="text-sm text-gray-400 mt-2 italic">{order.notes}</p>}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Update Status</h2>
            <form action={updateOrderStatus} className="flex gap-2">
              <input type="hidden" name="id" value={order.id} />
              <select name="status" defaultValue={order.status} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                Update
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-2">
              Placed {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Order Items</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Product</th>
                <th className="text-right px-6 py-3 text-gray-500 font-medium">Qty</th>
                <th className="text-right px-6 py-3 text-gray-500 font-medium">Unit Price</th>
                <th className="text-right px-6 py-3 text-gray-500 font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {order.order_items?.map((item: { id: string; product_name: string; quantity: number; unit_price: number; products?: { image_url: string | null } }) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.product_name}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{item.quantity}</td>
                  <td className="px-6 py-4 text-right text-gray-600">${Number(item.unit_price).toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">
                    ${(item.quantity * Number(item.unit_price)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-right font-semibold text-gray-700">Total</td>
                <td className="px-6 py-4 text-right font-bold text-gray-900 text-base">
                  ${Number(order.total_amount).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
