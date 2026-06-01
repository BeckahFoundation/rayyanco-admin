export interface Category {
  id: string
  name: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  sku: string | null
  description: string | null
  cost: number
  price: number
  sale_price: number | null
  price_on_request: boolean
  category_id: string | null
  image_url: string | null
  image_urls: string[]
  stock_quantity: number
  low_stock_threshold: number
  is_active: boolean
  created_at: string
  updated_at: string
  categories?: Category
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  notes: string | null
  total_amount: number
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  quantity: number
  unit_price: number
  created_at: string
  products?: Product
}

export type OrderStatus = Order['status']

export interface Inquiry {
  id: string
  product_id: string | null
  product_name: string | null
  name: string
  email: string
  phone: string | null
  company: string | null
  quantity: string | null
  message: string | null
  status: 'new' | 'contacted' | 'quoted' | 'closed'
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export type InquiryStatus = Inquiry['status']
