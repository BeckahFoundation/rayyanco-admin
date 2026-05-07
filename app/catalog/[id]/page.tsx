import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Flame, ArrowLeft, Mail, Phone, Tag, Package } from 'lucide-react'

export const revalidate = 60

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: p } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!p) notFound()

  const hasDiscount = p.sale_price && p.sale_price < p.price

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Nav */}
      <header className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Flame className="text-orange-400" size={24} />
            <span className="font-bold text-lg">Rayyanco LLC</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-gray-300 hover:text-white text-sm transition-colors">
            <ArrowLeft size={16} /> Back to Catalog
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="aspect-square bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {p.image_url ? (
              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Flame className="text-orange-200" size={80} />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {p.categories?.name && (
              <span className="text-sm text-orange-600 font-medium uppercase tracking-wider mb-2">{p.categories.name}</span>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{p.name}</h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-gray-900">
                ${Number(hasDiscount ? p.sale_price : p.price).toFixed(2)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-400 line-through">${Number(p.price).toFixed(2)}</span>
                  <span className="bg-orange-100 text-orange-700 text-sm font-semibold px-2 py-0.5 rounded-full">
                    Save ${(Number(p.price) - Number(p.sale_price)).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {p.description && (
              <p className="text-gray-600 leading-relaxed mb-6">{p.description}</p>
            )}

            <div className="space-y-2 mb-8">
              {p.sku && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Tag size={14} /> SKU: <span className="font-mono">{p.sku}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Package size={14} />
                {p.stock_quantity > 0 ? (
                  <span className="text-green-600 font-medium">In Stock ({p.stock_quantity} available)</span>
                ) : (
                  <span className="text-red-500 font-medium">Out of Stock</span>
                )}
              </div>
            </div>

            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
              <p className="font-semibold text-gray-900 mb-1">Interested in this product?</p>
              <p className="text-sm text-gray-500 mb-4">Contact us to place an order or ask a question.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href={`mailto:info@rayyanco.com?subject=Inquiry: ${encodeURIComponent(p.name)}`}
                  className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                  <Mail size={16} /> Email Inquiry
                </a>
                <a href="tel:+1234567890"
                  className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-xl border border-gray-200 transition-colors text-sm">
                  <Phone size={16} /> Call Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-950 text-gray-500 text-center text-sm py-6 mt-12">
        © {new Date().getFullYear()} Rayyanco LLC. All rights reserved.
      </footer>
    </div>
  )
}
