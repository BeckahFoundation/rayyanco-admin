import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import { updateStock } from './actions'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import type { Product } from '@/lib/types'

export default async function InventoryPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('stock_quantity', { ascending: true })

  const lowStock = (products ?? []).filter((p: Product) => p.stock_quantity <= p.low_stock_threshold)
  const inStock = (products ?? []).filter((p: Product) => p.stock_quantity > p.low_stock_threshold)

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Inventory</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Products" value={(products ?? []).length} color="blue" />
          <StatCard label="Low / Out of Stock" value={lowStock.length} color="red" />
          <StatCard label="In Stock" value={inStock.length} color="green" />
        </div>

        {lowStock.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="text-red-500" size={18} />
              <h2 className="font-semibold text-red-700">Low / Out of Stock ({lowStock.length})</h2>
            </div>
            <div className="space-y-2">
              {lowStock.map((p: Product & { categories: { name: string } | null }) => (
                <StockRow key={p.id} product={p} highlight />
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <CheckCircle className="text-green-500" size={18} />
            <h2 className="font-semibold text-gray-700">All Products</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {(products ?? []).map((p: Product & { categories: { name: string } | null }) => (
              <StockRow key={p.id} product={p} />
            ))}
            {!products?.length && (
              <p className="px-6 py-8 text-center text-gray-400 text-sm">No products.</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function StockRow({ product: p, highlight }: { product: Product & { categories: { name: string } | null }; highlight?: boolean }) {
  const pct = p.low_stock_threshold > 0 ? Math.min(100, (p.stock_quantity / (p.low_stock_threshold * 4)) * 100) : 100
  const isLow = p.stock_quantity <= p.low_stock_threshold

  return (
    <div className={`flex items-center gap-4 px-6 py-4 ${highlight ? 'bg-red-50/50' : ''}`}>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{p.name}</p>
        <p className="text-xs text-gray-400">{p.categories?.name ?? 'Uncategorized'} {p.sku && `· ${p.sku}`}</p>
      </div>
      <div className="hidden md:block w-32">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${isLow ? 'bg-red-400' : 'bg-green-400'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <form action={updateStock} className="flex items-center gap-2">
        <input type="hidden" name="id" value={p.id} />
        <input
          type="number" name="stock_quantity" defaultValue={p.stock_quantity} min="0"
          className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
          Update
        </button>
      </form>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = { blue: 'bg-blue-50 text-blue-700', red: 'bg-red-50 text-red-700', green: 'bg-green-50 text-green-700' }
  return (
    <div className={`rounded-xl p-5 ${colors[color]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm font-medium mt-1 opacity-80">{label}</p>
    </div>
  )
}
