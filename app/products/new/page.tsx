import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import ProductForm from '../ProductForm'

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')
  return (
    <AdminLayout>
      <div className="p-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Product</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <ProductForm categories={categories ?? []} />
        </div>
      </div>
    </AdminLayout>
  )
}
