'use client'

import { useState } from 'react'
import { Flame } from 'lucide-react'

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(0)
  const all = images.filter(Boolean)

  return (
    <div className="space-y-2">
      <div className="aspect-square bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {all[selected] ? (
          <img src={all[selected]} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Flame className="text-orange-200" size={80} />
          </div>
        )}
      </div>
      {all.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {all.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              className={`aspect-square rounded-xl border-2 overflow-hidden transition-all ${selected === i ? 'border-orange-500 shadow-md' : 'border-gray-100 hover:border-orange-300'}`}
            >
              <img src={url} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
