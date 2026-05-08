'use client'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

export default function ClickableRow({ href, children }: { href: string; children: ReactNode }) {
  const router = useRouter()
  return (
    <tr onClick={() => router.push(href)} className="hover:bg-orange-50 transition-colors cursor-pointer">
      {children}
    </tr>
  )
}
