import { supabase } from '@/lib/supabase/api'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const merchantId = searchParams.get('merchant_id') || 'demo_merchant'
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.log('[v0] Orders API error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(orders || [])
  } catch (err) {
    console.log('[v0] Orders API exception:', err)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { order, items } = body
    
    // Create the order
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()
    
    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }
    
    // Create order items
    const orderItems = items.map((item: { product_id: string; quantity: number; unit_price: number; subtotal: number }) => ({
      ...item,
      order_id: newOrder.id,
    }))
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
    
    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }
    
    return NextResponse.json(newOrder)
  } catch (err) {
    console.log('[v0] Orders POST exception:', err)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
