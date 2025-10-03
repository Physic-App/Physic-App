import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Debug: Log environment variables
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Present' : 'Missing');

// Only create Supabase client if credentials are properly configured
let supabase: any = null;

if (supabaseUrl && supabaseKey && supabaseUrl !== 'undefined' && supabaseKey !== 'undefined') {
  console.log('Creating Supabase client with provided credentials');
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.log('Using mock Supabase client - credentials not properly configured');
  // Supabase credentials not configured - app will run in demo mode
  // To enable database features, add these to your .env file:
  // VITE_SUPABASE_URL=your-supabase-url
  // VITE_SUPABASE_ANON_KEY=your-anon-key
  
  // Create a mock client that doesn't make network requests
  supabase = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signUp: () => Promise.resolve({ 
        data: { user: null, session: null }, 
        error: { message: 'Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file' } 
      }),
      signInWithPassword: () => Promise.resolve({ 
        data: { user: null, session: null }, 
        error: { message: 'Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file' } 
      }),
      signInWithOAuth: () => Promise.resolve({ 
        data: { provider: 'google', url: null }, 
        error: { message: 'Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file' } 
      }),
      updateUser: () => Promise.resolve({ 
        data: { user: null }, 
        error: { message: 'Supabase not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file' } 
      })
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null }),
      upsert: () => Promise.resolve({ data: [], error: null })
    })
  };
}

export { supabase }

