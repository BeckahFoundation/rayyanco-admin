import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, Building2, Package } from 'lucide-react'
import { updateInquiryStatus } from '../actions'
import type { Inquiry, InquiryStatus } from '@/lib/types'

const statusOptions: InquiryStatus[] = ['new', 'contacted', 'quoted', 'closed']

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('inquiries').select('*').eq('id', id).single()
  const inquiry = data as Inquiry | null
  if (!inquiry) notFound()

  return (
    <AdminLayout>
      <div className="p-8 max-w-4xl">
        <Link href="/inquiries" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft size={14} /> Back to inquiries
        </Link>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{inquiry.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Received {new Date(inquiry.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card title="Contact">
              <Row icon={<Mail size={14} />} label="Email">
                <a href={`mailto:${inquiry.email}`} className="text-orange-600 hover:underline">{inquiry.email}</a>
              </Row>
              {inquiry.phone && (
                <Row icon={<Phone size={14} />} label="Phone">
                  <a href={`tel:${inquiry.phone.replace(/\s/g, '')}`} className="text-orange-600 hover:underline">{inquiry.phone}</a>
                </Row>
              )}
              {inquiry.company && (
                <Row icon={<Building2 size={14} />} label="Company">{inquiry.company}</Row>
              )}
            </Card>

            <Card title="Inquiry">
              {inquiry.product_name && (
                <Row icon={<Package size={14} />} label="Product">
                  {inquiry.product_id ? (
                    <Link href={`/products/${inquiry.product_id}`} className="text-orange-600 hover:underline">
                      {inquiry.product_name}
                    </Link>
                  ) : inquiry.product_name}
                </Row>
              )}
              {inquiry.quantity && <Row label="Quantity / use case">{inquiry.quantity}</Row>}
              {inquiry.message && (
                <div className="pt-2">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-2">Message</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border border-gray-100">
                    {inquiry.message}
                  </p>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Status">
              <form action={updateInquiryStatus} className="space-y-3">
                <input type="hidden" name="id" value={inquiry.id} />
                <input type="hidden" name="admin_notes" value={inquiry.admin_notes ?? ''} />
                <select
                  name="status"
                  defaultValue={inquiry.status}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {statusOptions.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                  Update status
                </button>
              </form>
            </Card>

            <Card title="Internal notes">
              <form action={updateInquiryStatus} className="space-y-3">
                <input type="hidden" name="id" value={inquiry.id} />
                <input type="hidden" name="status" value={inquiry.status} />
                <textarea
                  name="admin_notes"
                  defaultValue={inquiry.admin_notes ?? ''}
                  rows={5}
                  placeholder="Notes only visible to admins…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                  Save notes
                </button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-4">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Row({ icon, label, children }: { icon?: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="w-32 flex items-center gap-2 text-gray-400 shrink-0 pt-0.5">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div className="text-gray-800 flex-1">{children}</div>
    </div>
  )
}
