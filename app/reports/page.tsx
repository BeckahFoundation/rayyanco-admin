import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import { TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react'

export default async function ReportsPage() {
  const supabase = await createClient()

  const [{ data: products }, { data: orderItems }, { data: orders }] = await Promise.all([
    supabase.from('products').select('id, name, sku, cost, price, sale_price, stock_quantity, categories(name)').order('name'),
    supabase.from('order_items').select('product_id, quantity, unit_price'),
    supabase.from('orders').select('total_amount, status, created_at').neq('status', 'cancelled'),
  ])

  // Per-product sales map
  const salesMap: Record<string, { qty: number; revenue: number }> = {}
  for (const item of orderItems ?? []) {
    if (!item.product_id) continue
    if (!salesMap[item.product_id]) salesMap[item.product_id] = { qty: 0, revenue: 0 }
    salesMap[item.product_id].qty += item.quantity
    salesMap[item.product_id].revenue += item.quantity * Number(item.unit_price)
  }

  // Build rows
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (products ?? []).map((p: any) => {
    const cost = Number(p.cost ?? 0)
    const price = Number(p.price)
    const salePrice = p.sale_price ? Number(p.sale_price) : null
    const effectivePrice = salePrice ?? price
    const margin = effectivePrice - cost
    const marginPct = effectivePrice > 0 ? (margin / effectivePrice) * 100 : 0
    const discountPct = salePrice ? ((price - salePrice) / price) * 100 : 0
    const sold = salesMap[p.id] ?? { qty: 0, revenue: 0 }
    const cogs = sold.qty * cost
    const grossProfit = sold.revenue - cogs
    const inventoryValue = p.stock_quantity * cost
    return { ...p, cost, price, salePrice, effectivePrice, margin, marginPct, discountPct, sold, cogs, grossProfit, inventoryValue }
  })

  // Totals
  const totalRevenue = rows.reduce((s, r) => s + r.sold.revenue, 0)
  const totalCOGS = rows.reduce((s, r) => s + r.cogs, 0)
  const totalGrossProfit = totalRevenue - totalCOGS
  const totalGrossMarginPct = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0
  const totalInventoryValue = rows.reduce((s, r) => s + r.inventoryValue, 0)

  const fmt = (n: number) => `$${n.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const pct = (n: number) => `${n.toFixed(1)}%`

  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profit & Loss Report</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <SummaryCard label="Total Revenue" value={fmt(totalRevenue)} icon={DollarSign} color="bg-green-500" />
          <SummaryCard label="Total COGS" value={fmt(totalCOGS)} icon={TrendingDown} color="bg-red-500" />
          <SummaryCard label="Gross Profit" value={fmt(totalGrossProfit)} icon={TrendingUp} color={totalGrossProfit >= 0 ? 'bg-blue-500' : 'bg-red-600'} />
          <SummaryCard label="Inventory Value" value={fmt(totalInventoryValue)} icon={Package} color="bg-orange-500" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Product Profitability</h2>
            <span className="text-sm text-gray-400">Overall margin: <strong className="text-gray-700">{pct(totalGrossMarginPct)}</strong></span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Product</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Cost</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">List Price</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Sale Price</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Discount</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Margin $</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Margin %</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Units Sold</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Revenue</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">COGS</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Gross Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-[160px]">{r.name}</p>
                      {r.sku && <p className="text-xs text-gray-400 font-mono">{r.sku}</p>}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{fmt(r.cost)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{fmt(r.price)}</td>
                    <td className="px-4 py-3 text-right">
                      {r.salePrice ? <span className="text-orange-600 font-medium">{fmt(r.salePrice)}</span> : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.discountPct > 0
                        ? <span className="text-red-500 font-medium">-{pct(r.discountPct)}</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{fmt(r.margin)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${r.marginPct >= 30 ? 'text-green-600' : r.marginPct >= 10 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {pct(r.marginPct)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{r.sold.qty}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{fmt(r.sold.revenue)}</td>
                    <td className="px-4 py-3 text-right text-red-400">{fmt(r.cogs)}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      <span className={r.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}>{fmt(r.grossProfit)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                <tr>
                  <td className="px-4 py-3 text-gray-700">TOTAL</td>
                  <td colSpan={7} />
                  <td className="px-4 py-3 text-right text-gray-900">{fmt(totalRevenue)}</td>
                  <td className="px-4 py-3 text-right text-red-500">{fmt(totalCOGS)}</td>
                  <td className={`px-4 py-3 text-right ${totalGrossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{fmt(totalGrossProfit)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function SummaryCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{label}</span>
        <div className={`${color} p-2 rounded-lg`}><Icon className="text-white" size={16} /></div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
