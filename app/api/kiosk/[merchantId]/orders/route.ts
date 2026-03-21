import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Public API for kiosk - no auth required for creating orders
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  try {
    const { merchantId } = await params
    const body = await request.json()
    
    const { items, total, tax, paymentMethod, deviceId, cloverOrderId } = body
    
    // Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: merchantId,
        merchant_id: merchantId, // Keep for backwards compatibility
        total,
        tax: tax || 0,
        status: 'completed',
        payment_method: paymentMethod || 'card',
        device_id: deviceId,
        clover_order_id: cloverOrderId
      })
      .select()
      .single()
    
    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }
    
    // Create order items
    if (items && items.length > 0) {
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.subtotal
      }))
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
      
      if (itemsError) {
        console.error('Error creating order items:', itemsError)
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      message: 'Pedido creado exitosamente'
    })
  } catch (err) {
    return NextResponse.json({ error: 'Error al crear pedido' }, { status: 500 })
  }
}
