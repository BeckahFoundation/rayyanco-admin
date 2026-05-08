'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { upsertProduct } from './actions'
import type { Category, Product } from '@/lib/types'
import { Upload, X } from 'lucide-react'

const MAX_IMAGES = 4

interface Props {
  product?: Product & { image_urls?: string[] }
  categories: Category[]
}

export default function ProductForm({ product, categories }: Props) {
  const router = useRouter()
  const fileRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]
  const [images, setImages] = useState<string[]>(() => {
    const existing = product?.image_urls?.length ? product.image_urls : (product?.image_url ? [product.image_url] : [])
    return [...existing, ...Array(MAX_IMAGES - existing.length).fill('')].slice(0, MAX_IMAGES)
  })
  const [uploading, setUploading] = useState<boolean[]>([false, false, false, false])
  const [error, setError] = useState('')

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(prev => { const n = [...prev]; n[idx] = true; return n })
    setError('')
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `products/${Date.now()}-${idx}.${ext}`
    const { error: err } = await supabase.storage.from('products').upload(path, file, { upsert: true })
    if (err) {
      setError(err.message)
    } else {
      const { data } = supabase.storage.from('products').getPublicUrl(path)
      setImages(prev => { const n = [...prev]; n[idx] = data.publicUrl; return n })
    }
    setUploading(prev => { const n = [...prev]; n[idx] = false; return n })
  }

  function removeImage(idx: number) {
    setImages(prev => { const n = [...prev]; n[idx] = ''; return n })
  }

  const filled = images.filter(Boolean)

  return (
    <form action={upsertProduct} className="space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="image_url" value={images[0] ?? ''} />
      <input type="hidden" name="image_urls" value={JSON.stringify(filled)} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Field label="Product Name *" name="name" defaultValue={product?.name} required />
          <Field label="SKU (auto-generated if blank)" name="sku" defaultValue={product?.sku ?? ''} placeholder="e.g. RYC-ABC123" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="category_id" defaultValue={product?.category_id ?? ''} className={inputCls + ' text-gray-900'}>
              <option value="">— None —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" defaultValue={product?.description ?? ''} rows={4} className={inputCls + ' text-gray-900'} />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Images <span className="text-gray-400 font-normal">(up to 4)</span></label>
            <div className="grid grid-cols-2 gap-2">
              {images.map((url, idx) => (
                <div key={idx}>
                  <div
                    onClick={() => fileRefs[idx].current?.click()}
                    className={`border-2 border-dashed rounded-xl cursor-pointer transition-colors h-28 flex items-center justify-center overflow-hidden relative
                      ${url ? 'border-orange-300' : 'border-gray-200 hover:border-orange-400'}`}
                  >
                    {url ? (
                      <>
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={e => { e.stopPropagation(); removeImage(idx) }}
                          className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow hover:bg-red-50">
                          <X size={12} className="text-red-500" />
                        </button>
                        {idx === 0 && <span className="absolute bottom-1 left-1 bg-orange-600 text-white text-xs px-1.5 py-0.5 rounded font-medium">Main</span>}
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-gray-300">
                        <Upload size={20} className="mb-1" />
                        <p className="text-xs">{uploading[idx] ? 'Uploading…' : idx === 0 ? 'Main photo' : `Photo ${idx + 1}`}</p>
                      </div>
                    )}
                  </div>
                  <input ref={fileRefs[idx]} type="file" accept="image/*" onChange={e => handleUpload(e, idx)} className="hidden" />
                </div>
              ))}
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <div className="flex items-center gap-3 pb-1">
            <input type="checkbox" id="price_on_request" name="price_on_request" value="true" defaultChecked={!!(product as any)?.price_on_request} className="w-4 h-4 accent-orange-600" />
            <label htmlFor="price_on_request" className="text-sm font-medium text-gray-700">Price available upon request</label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Cost ($)" name="cost" type="number" step="0.01" min="0" defaultValue={(product as Product & { cost?: number })?.cost ?? ''} />
            <Field label="Price ($)" name="price" type="number" step="0.01" min="0" defaultValue={product?.price ?? ''} />
            <Field label="Sale Price ($)" name="sale_price" type="number" step="0.01" min="0" defaultValue={product?.sale_price ?? ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Stock Qty *" name="stock_quantity" type="number" min="0" defaultValue={product?.stock_quantity ?? 0} required />
            <Field label="Low Stock Alert" name="low_stock_threshold" type="number" min="0" defaultValue={product?.low_stock_threshold ?? 5} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="is_active" defaultValue={product?.is_active !== false ? 'true' : 'false'} className={inputCls + ' text-gray-900'}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors">
          {product ? 'Save Changes' : 'Create Product'}
        </button>
        <button type="button" onClick={() => router.push('/products')} className="border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium px-6 py-2.5 rounded-lg transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500'

function Field({ label, name, type = 'text', defaultValue, required, step, min, placeholder }: {
  label: string; name: string; type?: string; defaultValue?: string | number | null
  required?: boolean; step?: string; min?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} name={name} defaultValue={defaultValue ?? ''} required={required} step={step} min={min} placeholder={placeholder} className={inputCls} />
    </div>
  )
}
