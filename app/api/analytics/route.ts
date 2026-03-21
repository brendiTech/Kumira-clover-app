import { supabase } from '@/lib/supabase/api'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const merchantId = searchParams.get('merchant_id') || 'demo_merchant'
    const period = searchParams.get('period') || 'today'
    
    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    }
    
    // Get orders for the period
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('merchant_id', merchantId)
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
    
    if (ordersError) {
      console.log('[v0] Analytics orders error:', ordersError.message)
      return NextResponse.json({ error: ordersError.message }, { status: 500 })
    }
    
    // Get order items with products
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products(name, category),
        order:orders!inner(merchant_id, status, created_at)
      `)
      .eq('order.merchant_id', merchantId)
      .eq('order.status', 'completed')
      .gte('order.created_at', startDate.toISOString())
    
    if (itemsError) {
      console.log('[v0] Analytics items error:', itemsError.message)
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }
    
    // Calculate stats
    const totalRevenue = orders?.reduce((sum, o) => sum + o.total, 0) || 0
    const totalOrders = orders?.length || 0
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    
    // Product analytics
    const productStats: Record<string, { count: number; revenue: number }> = {}
    orderItems?.forEach(item => {
      const name = item.product?.name || 'Desconocido'
      if (!productStats[name]) {
        productStats[name] = { count: 0, revenue: 0 }
      }
      productStats[name].count += item.quantity
      productStats[name].revenue += item.subtotal
    })
    
    const topProducts = Object.entries(productStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
    
    // Revenue by hour
    const hourlyRevenue: Record<string, number> = {}
    orders?.forEach(order => {
      const hour = new Date(order.created_at).getHours()
      const hourKey = `${hour.toString().padStart(2, '0')}:00`
      hourlyRevenue[hourKey] = (hourlyRevenue[hourKey] || 0) + order.total
    })
    
    const revenueByHour = Array.from({ length: 24 }, (_, i) => {
      const hour = `${i.toString().padStart(2, '0')}:00`
      return { hour, revenue: hourlyRevenue[hour] || 0 }
    })
    
    // Orders by status
    const { data: allOrders } = await supabase
      .from('orders')
      .select('status')
      .eq('merchant_id', merchantId)
      .gte('created_at', startDate.toISOString())
    
    const statusCounts: Record<string, number> = {}
    allOrders?.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
    })
    
    const ordersByStatus = Object.entries(statusCounts)
      .map(([status, count]) => ({ status, count }))
    
    return NextResponse.json({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      topProducts,
      revenueByHour,
      ordersByStatus,
    })
  } catch (err) {
    console.log('[v0] Analytics API exception:', err)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
