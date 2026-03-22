import { createClient } from '@supabase/supabase-js'

// Direct Supabase client for API routes (no cookies needed)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
