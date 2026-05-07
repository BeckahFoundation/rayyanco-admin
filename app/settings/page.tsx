import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import { saveSettings } from './actions'
import { Settings } from 'lucide-react'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('settings').select('*')
  const s: Record<string, string> = {}
  for (const row of data ?? []) s[row.key] = row.value

  return (
    <AdminLayout>
      <div className="p-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Settings size={22} className="text-gray-500" />
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form action={saveSettings} className="space-y-5">
            <div className="pb-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-700 mb-4">Company Info</h2>
              <div className="space-y-4">
                <Field label="Company Name" name="company_name" defaultValue={s.company_name ?? 'Rayyanco LLC'} />
                <Field label="Tagline" name="company_tagline" defaultValue={s.company_tagline ?? 'Sauna Components'} />
              </div>
            </div>
            <div className="pt-1">
              <h2 className="font-semibold text-gray-700 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <Field label="Email Address" name="contact_email" type="email" defaultValue={s.contact_email ?? ''} placeholder="info@rayyanco.com" />
                <Field label="Phone Number" name="contact_phone" defaultValue={s.contact_phone ?? ''} placeholder="+1 (555) 000-0000" />
              </div>
            </div>
            <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors">
              Save Settings
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500'

function Field({ label, name, type = 'text', defaultValue, placeholder }: {
  label: string; name: string; type?: string; defaultValue?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} name={name} defaultValue={defaultValue} placeholder={placeholder} className={inputCls} />
    </div>
  )
}
