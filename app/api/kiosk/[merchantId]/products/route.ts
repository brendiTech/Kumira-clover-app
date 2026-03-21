import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Public API for kiosk - no auth required
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ merchantId: string }> }
) {
  try {
    const { merchantId } = await params
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, description, price, category, image_url')
      .eq('user_id', merchantId)
      .eq('available', true)
      .order('category')
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(products || [])
  } catch (err) {
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}
