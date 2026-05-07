import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Eye } from 'lucide-react'
import { deleteOrder } from './actions'
import DeleteButton from '@/components/DeleteButton'
import type { Order } from '@/lib/types'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <Link
            href="/orders/new"
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} />
            New Order
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Order #</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Customer</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-right px-6 py-3 text-gray-500 font-medium">Total</th>
                  <th className="text-right px-6 py-3 text-gray-500 font-medium">Date</th>
                  <th className="text-right px-6 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(orders ?? []).map((order: Order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600">{order.order_number}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{order.customer_name}</p>
                      {order.customer_email && <p className="text-xs text-gray-400">{order.customer_email}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900">
                      ${Number(order.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-400 text-xs">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/orders/${order.id}`} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900">
                          <Eye size={15} />
                        </Link>
                        <DeleteButton action={deleteOrder} id={order.id} />
                      </div>
                    </td>
                  </tr>
                ))}
                {!orders?.length && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
