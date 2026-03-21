import { supabase } from '@/lib/supabase/api'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params
    const { searchParams } = new URL(request.url)
    const merchantId = searchParams.get('merchant_id') || 'demo_merchant'
    
    // Get today's date
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    // Get all-time stats for this product
    const { data: allTimeItems, error: allTimeError } = await supabase
      .from('order_items')
      .select(`
        quantity,
        subtotal,
        order:orders!inner(merchant_id, status)
      `)
      .eq('product_id', productId)
      .eq('order.merchant_id', merchantId)
      .eq('order.status', 'completed')
    
    if (allTimeError) {
      console.log('[v0] Product stats all-time error:', allTimeError.message)
      return NextResponse.json({ error: allTimeError.message }, { status: 500 })
    }
    
    // Get today's stats for this product
    const { data: todayItems, error: todayError } = await supabase
      .from('order_items')
      .select(`
        quantity,
        subtotal,
        order:orders!inner(merchant_id, status, created_at)
      `)
      .eq('product_id', productId)
      .eq('order.merchant_id', merchantId)
      .eq('order.status', 'completed')
      .gte('order.created_at', todayStart.toISOString())
    
    if (todayError) {
      console.log('[v0] Product stats today error:', todayError.message)
      return NextResponse.json({ error: todayError.message }, { status: 500 })
    }
    
    // Calculate stats
    const totalSold = allTimeItems?.reduce((sum, item) => sum + item.quantity, 0) || 0
    const totalRevenue = allTimeItems?.reduce((sum, item) => sum + item.subtotal, 0) || 0
    const todaySold = todayItems?.reduce((sum, item) => sum + item.quantity, 0) || 0
    const todayRevenue = todayItems?.reduce((sum, item) => sum + item.subtotal, 0) || 0
    
    return NextResponse.json({
      totalSold,
      totalRevenue,
      todaySold,
      todayRevenue,
    })
  } catch (err) {
    console.log('[v0] Product stats API exception:', err)
    return NextResponse.json({ error: 'Failed to fetch product stats' }, { status: 500 })
  }
}
