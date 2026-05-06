'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createOrder } from '../actions'
import { Plus, Trash2 } from 'lucide-react'

interface ProductOption {
  id: string
  name: string
  price: number
  sale_price: number | null
  stock_quantity: number
}

interface LineItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
}

export default function NewOrderForm({ products }: { products: ProductOption[] }) {
  const router = useRouter()
  const [items, setItems] = useState<LineItem[]>([])

  function addItem() {
    if (!products.length) return
    const p = products[0]
    setItems(prev => [...prev, { product_id: p.id, product_name: p.name, quantity: 1, unit_price: p.sale_price ?? p.price }])
  }

  function updateItem(idx: number, field: keyof LineItem, value: string | number) {
    setItems(prev => {
      const next = [...prev]
      if (field === 'product_id') {
        const p = products.find(p => p.id === value)
        if (p) next[idx] = { ...next[idx], product_id: p.id, product_name: p.name, unit_price: p.sale_price ?? p.price }
      } else {
        next[idx] = { ...next[idx], [field]: field === 'quantity' ? Number(value) : Number(value) }
      }
      return next
    })
  }

  const total = items.reduce((s, i) => s + i.quantity * i.unit_price, 0)

  async function handleSubmit(formData: FormData) {
    formData.set('items', JSON.stringify(items))
    await createOrder(formData)
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Customer Name *" name="customer_name" required />
        <Field label="Email" name="customer_email" type="email" />
        <Field label="Phone" name="customer_phone" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea name="notes" rows={2} className={inputCls} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700">Order Items</h2>
          <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium">
            <Plus size={15} /> Add Item
          </button>
        </div>
        {items.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
            No items added yet. Click "Add Item" to start.
          </p>
        )}
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <select
                value={item.product_id}
                onChange={e => updateItem(idx, 'product_id', e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input
                type="number" min="1" value={item.quantity}
                onChange={e => updateItem(idx, 'quantity', e.target.value)}
                className="w-16 border border-gray-200 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              />
              <input
                type="number" min="0" step="0.01" value={item.unit_price}
                onChange={e => updateItem(idx, 'unit_price', e.target.value)}
                className="w-24 border border-gray-200 rounded-lg px-2 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              />
              <span className="text-sm font-medium text-gray-700 w-20 text-right">
                ${(item.quantity * item.unit_price).toFixed(2)}
              </span>
              <button type="button" onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="flex justify-end mt-3">
            <span className="font-bold text-gray-900">Total: ${total.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={items.length === 0}
          className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          Create Order
        </button>
        <button type="button" onClick={() => router.push('/orders')} className="border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium px-6 py-2.5 rounded-lg">
          Cancel
        </button>
      </div>
    </form>
  )
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500'

function Field({ label, name, type = 'text', required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} name={name} required={required} className={inputCls} />
    </div>
  )
}
