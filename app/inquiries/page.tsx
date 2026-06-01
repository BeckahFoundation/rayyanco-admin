import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Eye, Mail, Phone, Building2 } from 'lucide-react'
import { deleteInquiry } from './actions'
import DeleteButton from '@/components/DeleteButton'
import type { Inquiry, InquiryStatus } from '@/lib/types'

const statusColors: Record<InquiryStatus, string> = {
  new: 'bg-orange-100 text-orange-700',
  contacted: 'bg-blue-100 text-blue-700',
  quoted: 'bg-purple-100 text-purple-700',
  closed: 'bg-gray-100 text-gray-600',
}

const statusLabels: Record<InquiryStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  closed: 'Closed',
}

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const supabase = await createClient()

  let query = supabase.from('inquiries').select('*').order('created_at', { ascending: false })
  if (status && status !== 'all' && status in statusLabels) {
    query = query.eq('status', status)
  }
  const { data: inquiries } = await query

  const { data: counts } = await supabase.from('inquiries').select('status')
  const countByStatus = (counts ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})
  const total = counts?.length ?? 0

  const filters: Array<{ key: string; label: string; count: number }> = [
    { key: 'all', label: 'All', count: total },
    { key: 'new', label: 'New', count: countByStatus.new ?? 0 },
    { key: 'contacted', label: 'Contacted', count: countByStatus.contacted ?? 0 },
    { key: 'quoted', label: 'Quoted', count: countByStatus.quoted ?? 0 },
    { key: 'closed', label: 'Closed', count: countByStatus.closed ?? 0 },
  ]
  const active = status ?? 'all'

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
            <p className="text-sm text-gray-500 mt-1">Customer pricing requests from the public catalog.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map(f => (
            <Link
              key={f.key}
              href={f.key === 'all' ? '/inquiries' : `/inquiries?status=${f.key}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                active === f.key
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {f.label} <span className="opacity-60">({f.count})</span>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Customer</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Product</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-right px-6 py-3 text-gray-500 font-medium">Received</th>
                  <th className="text-right px-6 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(inquiries ?? []).map((i: Inquiry) => (
                  <tr key={i.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{i.name}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1"><Mail size={11} /> {i.email}</span>
                        {i.phone && <span className="flex items-center gap-1"><Phone size={11} /> {i.phone}</span>}
                        {i.company && <span className="flex items-center gap-1"><Building2 size={11} /> {i.company}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{i.product_name ?? <span className="text-gray-400">—</span>}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[i.status]}`}>
                        {statusLabels[i.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-400 text-xs">
                      {new Date(i.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/inquiries/${i.id}`} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900">
                          <Eye size={15} />
                        </Link>
                        <DeleteButton action={deleteInquiry} id={i.id} />
                      </div>
                    </td>
                  </tr>
                ))}
                {!inquiries?.length && (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No inquiries{active !== 'all' ? ` with status "${active}"` : ''} yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
