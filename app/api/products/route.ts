import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const includeUnavailable = searchParams.get('all') === 'true'
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    let query = supabase
      .from('products')
      .select('*')
      .order('category')
      .order('name')
    
    // If user is logged in, filter by user_id
    if (user) {
      query = query.eq('user_id', user.id)
    }
    
    if (!includeUnavailable) {
      query = query.eq('available', true)
    }
    
    const { data: products, error } = await query
    
    console.log('[v0] Products GET - user:', user?.id, 'count:', products?.length, 'error:', error?.message)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(products || [])
  } catch (err) {
    console.log('[v0] Products GET exception:', err)
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.log('[v0] Products POST - no authenticated user')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    
    console.log('[v0] Products POST - user:', user.id, 'body:', body)
    
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: body.name,
        description: body.description,
        price: body.price,
        category: body.category,
        image_url: body.image_url,
        available: body.available ?? true,
        user_id: user.id,
        merchant_id: user.id, // Keep for backwards compatibility
      })
      .select()
      .single()
    
    console.log('[v0] Products POST result:', data, 'error:', error?.message)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (err) {
    console.log('[v0] Products POST exception:', err)
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}
