'use client'

import { useState, useTransition } from 'react'
import { X, Mail, Send, CheckCircle2 } from 'lucide-react'
import { submitInquiry } from '@/app/inquiries/actions'

type Props = {
  productId: string
  productName: string
}

export default function InquiryForm({ productId, productName }: Props) {
  const [open, setOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await submitInquiry(formData)
      if (res.ok) setDone(true)
      else setError(res.error ?? 'Something went wrong.')
    })
  }

  function close() {
    setOpen(false)
    // small delay before reset so close animation reads cleanly
    setTimeout(() => { setDone(false); setError(null) }, 200)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
      >
        <Mail size={16} /> Request Pricing
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={close}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {done ? (
              <div className="p-8 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
                  <CheckCircle2 className="text-green-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Thanks — we got it.</h3>
                <p className="text-gray-600 text-sm mb-6">
                  We&apos;ll review your inquiry for <strong>{productName}</strong> and get back to you shortly.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            ) : (
              <form action={handleSubmit} className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Request Pricing</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Inquiring about <strong>{productName}</strong>
                </p>

                <input type="hidden" name="product_id" value={productId} />
                <input type="hidden" name="product_name" value={productName} />

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field name="name" label="Full Name" required />
                    <Field name="email" label="Email" type="email" required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field name="phone" label="Phone" type="tel" />
                    <Field name="company" label="Company" />
                  </div>
                  <Field name="quantity" label="Quantity / Use case" placeholder="e.g. 10 units for a wellness center" />
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      placeholder="Tell us more about your needs…"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {error && (
                  <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isPending}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
                >
                  <Send size={16} />
                  {isPending ? 'Sending…' : 'Send Inquiry'}
                </button>
                <p className="mt-3 text-xs text-gray-400 text-center">
                  We respond to all serious inquiries within 1 business day.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function Field({
  name, label, type = 'text', required = false, placeholder,
}: { name: string; label: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      />
    </div>
  )
}
