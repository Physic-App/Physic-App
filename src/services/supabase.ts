import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ [Supabase] Missing credentials!');
  console.error('Add these to your .env file:');
  console.error('VITE_SUPABASE_URL=https://jpbsslcrqyucaucznaxu.supabase.co');
  console.error('VITE_SUPABASE_ANON_KEY=your-anon-key-from-supabase');
  console.error('Then restart the dev server.');
} else {
  console.log('✅ [Supabase] Connected to:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl || 'http://localhost', supabaseKey || 'anonymous')

