import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Only create Supabase client if credentials are properly configured
let supabase: any = null;

if (supabaseUrl && supabaseKey && supabaseUrl !== 'undefined' && supabaseKey !== 'undefined') {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  // Supabase credentials not configured - app will run in demo mode
  // To enable database features, add these to your .env file:
  // VITE_SUPABASE_URL=your-supabase-url
  // VITE_SUPABASE_ANON_KEY=your-anon-key
  
  // Create a mock client that doesn't make network requests
  supabase = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null })
    })
  };
}

export { supabase }

