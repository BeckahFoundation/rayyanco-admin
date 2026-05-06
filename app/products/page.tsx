import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { deleteProduct } from './actions'
import type { Product } from '@/lib/types'

export default async function ProductsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <Link
            href="/products/new"
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Add Product
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Product</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">SKU</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Category</th>
                  <th className="text-right px-6 py-3 text-gray-500 font-medium">Price</th>
                  <th className="text-right px-6 py-3 text-gray-500 font-medium">Stock</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-right px-6 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(products ?? []).map((p: Product & { categories: { name: string } | null }) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-300 text-xs font-bold">
                            {p.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{p.sku ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-500">{p.categories?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <div>
                        <span className="font-semibold text-gray-900">${Number(p.price).toFixed(2)}</span>
                        {p.sale_price && (
                          <span className="ml-2 text-xs text-orange-600 font-medium">${Number(p.sale_price).toFixed(2)} sale</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-medium ${p.stock_quantity <= p.low_stock_threshold ? 'text-red-600' : 'text-gray-900'}`}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/products/${p.id}`} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900">
                          <Pencil size={15} />
                        </Link>
                        <form action={deleteProduct}>
                          <input type="hidden" name="id" value={p.id} />
                          <button type="submit" className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-600"
                            onClick={e => { if (!confirm('Delete this product?')) e.preventDefault() }}>
                            <Trash2 size={15} />
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {!products?.length && (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No products yet. <Link href="/products/new" className="text-orange-600 hover:underline">Add one</Link>.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
