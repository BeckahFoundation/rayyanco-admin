import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import { Package, ShoppingCart, DollarSign, AlertTriangle } from 'lucide-react'

async function getStats() {
  const supabase = await createClient()
  const [products, orders, lowStock] = await Promise.all([
    supabase.from('products').select('id, price, stock_quantity, low_stock_threshold, is_active'),
    supabase.from('orders').select('id, total_amount, status, created_at'),
    supabase.from('products').select('id').filter('stock_quantity', 'lte', 'low_stock_threshold'),
  ])

  const totalProducts = products.data?.length ?? 0
  const activeProducts = products.data?.filter(p => p.is_active).length ?? 0
  const totalRevenue = orders.data?.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total_amount), 0) ?? 0
  const pendingOrders = orders.data?.filter(o => o.status === 'pending').length ?? 0
  const totalOrders = orders.data?.length ?? 0

  // Low stock: stock_quantity <= low_stock_threshold
  const lowStockCount = products.data?.filter(p => p.stock_quantity <= p.low_stock_threshold).length ?? 0

  // Recent orders
  const recent = (orders.data ?? [])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return { totalProducts, activeProducts, totalRevenue, pendingOrders, totalOrders, lowStockCount, recent }
}

export default async function DashboardPage() {
  const { totalProducts, activeProducts, totalRevenue, pendingOrders, totalOrders, lowStockCount, recent } = await getStats()

  const stats = [
    { label: 'Total Products', value: totalProducts, sub: `${activeProducts} active`, icon: Package, color: 'bg-blue-500' },
    { label: 'Total Orders', value: totalOrders, sub: `${pendingOrders} pending`, icon: ShoppingCart, color: 'bg-green-500' },
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString('en', { minimumFractionDigits: 2 })}`, sub: 'All time', icon: DollarSign, color: 'bg-orange-500' },
    { label: 'Low Stock Items', value: lowStockCount, sub: 'Need restocking', icon: AlertTriangle, color: 'bg-red-500' },
  ]

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {stats.map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-500">{label}</span>
                <div className={`${color} p-2 rounded-lg`}>
                  <Icon className="text-white" size={18} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-400 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
          {recent.length === 0 ? (
            <p className="text-gray-400 text-sm">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Order</th>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium">Status</th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">Amount</th>
                    <th className="text-right py-2 px-3 text-gray-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((order: { id: string; status: string; total_amount: number; created_at: string }) => (
                    <tr key={order.id} className="border-b border-gray-50">
                      <td className="py-2 px-3 font-mono text-xs text-gray-600">{order.id.slice(0, 8)}…</td>
                      <td className="py-2 px-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-2 px-3 text-right font-medium">${Number(order.total_amount).toFixed(2)}</td>
                      <td className="py-2 px-3 text-right text-gray-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
