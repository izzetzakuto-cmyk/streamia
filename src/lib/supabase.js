import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: (...args) => {
      // 8 second timeout on all requests — never hangs forever
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      return fetch(...args, { signal: controller.signal })
        .finally(() => clearTimeout(timeout))
    }
  }
})

// Wake up Supabase immediately when app loads (kills cold start delay)
supabase.from('profiles').select('id').limit(1).then(() => {})

// Then keep it awake every 4 minutes
setInterval(() => {
  supabase.from('profiles').select('id').limit(1).then(() => {})
}, 4 * 60 * 1000)
