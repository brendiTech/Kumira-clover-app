export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  image_url: string | null
  available: boolean
  clover_item_id: string | null
  merchant_id: string
  created_at: string
}

export interface Order {
  id: string
  clover_order_id: string | null
  merchant_id: string
  total: number
  tax: number
  status: string
  payment_method: string | null
  device_id: string | null
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
  product?: Product
}

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  topProducts: { name: string; count: number; revenue: number }[]
  revenueByHour: { hour: string; revenue: number }[]
  ordersByStatus: { status: string; count: number }[]
}

export interface CartItem extends Product {
  quantity: number
}
