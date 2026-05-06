import AdminLayout from '@/components/AdminLayout'
import { createClient } from '@/lib/supabase/server'
import ProductForm from '../ProductForm'
import { notFound } from 'next/navigation'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('name'),
  ])
  if (!product) notFound()
  return (
    <AdminLayout>
      <div className="p-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <ProductForm product={product} categories={categories ?? []} />
        </div>
      </div>
    </AdminLayout>
  )
}
