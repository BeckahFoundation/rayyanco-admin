'use client'

import { Trash2 } from 'lucide-react'

export default function DeleteButton({ action, id }: { action: (f: FormData) => Promise<void>; id: string }) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-600"
        onClick={e => { e.stopPropagation(); if (!confirm('Are you sure you want to delete this?')) e.preventDefault() }}
      >
        <Trash2 size={15} />
      </button>
    </form>
  )
}
