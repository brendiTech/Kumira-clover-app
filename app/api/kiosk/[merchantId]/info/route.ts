import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Public API to get merchant info for kiosk display
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
    
    const { data: merchant, error } = await supabase
      .from('merchants')
      .select('business_name')
      .eq('id', merchantId)
      .single()
    
    if (error || !merchant) {
      return NextResponse.json({ error: 'Comercio no encontrado' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      businessName: merchant.business_name 
    })
  } catch (err) {
    return NextResponse.json({ error: 'Error al obtener información' }, { status: 500 })
  }
}
