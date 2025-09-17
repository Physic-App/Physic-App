import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseKey) {
  // Surface a helpful dev-time message without crashing the app
  // Ensure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set in your .env
  // Example:
  // VITE_SUPABASE_URL=https://your-project.supabase.co
  // VITE_SUPABASE_ANON_KEY=eyJhbGci...
  console.warn('[Supabase] Missing env vars: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl || 'http://localhost', supabaseKey || 'anonymous')

