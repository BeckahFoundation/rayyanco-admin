'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { upsertProduct } from './actions'
import type { Category, Product } from '@/lib/types'
import { Upload, X } from 'lucide-react'

interface Props {
  product?: Product
  categories: Category[]
}

export default function ProductForm({ product, categories }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `products/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('products').upload(path, file, { upsert: true })
    if (error) {
      setUploadError(error.message)
    } else {
      const { data } = supabase.storage.from('products').getPublicUrl(path)
      setImageUrl(data.publicUrl)
    }
    setUploading(false)
  }

  return (
    <form ref={formRef} action={upsertProduct} className="space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="image_url" value={imageUrl} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Field label="Product Name *" name="name" defaultValue={product?.name} required />
          <Field label="SKU" name="sku" defaultValue={product?.sku ?? ''} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="category_id" defaultValue={product?.category_id ?? ''} className={inputCls}>
              <option value="">— None —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" defaultValue={product?.description ?? ''} rows={4} className={inputCls} />
          </div>
        </div>

        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-4 cursor-pointer hover:border-orange-400 transition-colors"
            >
              {imageUrl ? (
                <div className="relative">
                  <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setImageUrl('') }}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50"
                  >
                    <X size={14} className="text-red-500" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 text-gray-400">
                  <Upload size={24} className="mb-2" />
                  <p className="text-sm">{uploading ? 'Uploading…' : 'Click to upload image'}</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Price ($) *" name="price" type="number" step="0.01" min="0" defaultValue={product?.price ?? ''} required />
            <Field label="Sale Price ($)" name="sale_price" type="number" step="0.01" min="0" defaultValue={product?.sale_price ?? ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Stock Qty *" name="stock_quantity" type="number" min="0" defaultValue={product?.stock_quantity ?? 0} required />
            <Field label="Low Stock Alert" name="low_stock_threshold" type="number" min="0" defaultValue={product?.low_stock_threshold ?? 5} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select name="is_active" defaultValue={product?.is_active !== false ? 'true' : 'false'} className={inputCls}>
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

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500'

function Field({ label, name, type = 'text', defaultValue, required, step, min }: {
  label: string; name: string; type?: string; defaultValue?: string | number | null
  required?: boolean; step?: string; min?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type} name={name}
        defaultValue={defaultValue ?? ''}
        required={required} step={step} min={min}
        className={inputCls}
      />
    </div>
  )
}
