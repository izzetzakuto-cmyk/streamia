// ─────────────────────────────────────────────────────────
// Global data cache — makes every page feel instant
// Data is cached in memory and reused across page navigations
// Stale data shows immediately, fresh data loads in background
// ─────────────────────────────────────────────────────────
import useSWR, { SWRConfig, mutate } from 'swr'
import { supabase } from './supabase'

// ── SWR Config — wrap your app with this ──
export { SWRConfig }

export const swrConfig = {
  // Show cached data immediately, refresh in background
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,       // Don't re-fetch same key within 5s
  focusThrottleInterval: 30000, // Don't re-fetch on tab focus more than every 30s
  errorRetryCount: 2,
  errorRetryInterval: 3000,
}

// ── Generic Supabase fetcher ──
export const fetcher = async (key) => {
  const { data, error } = await JSON.parse(key)
  if (error) throw error
  return data
}

// ── Pre-built hooks with caching ──

// Feed posts — cached, instant on re-visit
export function usePosts() {
  return useSWR('posts', async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('id, content, likes_count, comments_count, created_at, user_id, profiles(id, display_name, handle, category, is_live, is_verified)')
      .order('created_at', { ascending: false })
      .limit(20)
    if (error) throw error
    return data || []
  }, { ...swrConfig, refreshInterval: 30000 }) // Auto-refresh feed every 30s
}

// Profile — cached per user ID
export function useProfile(userId) {
  return useSWR(userId ? `profile-${userId}` : null, async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  }, swrConfig)
}

// Jobs — cached
export function useJobs(filters = {}) {
  const key = `jobs-${JSON.stringify(filters)}`
  return useSWR(key, async () => {
    let query = supabase.from('jobs')
      .select('id, title, job_type, platform, pay_min, pay_max, pay_period, requirements, description, created_at, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (filters.type && filters.type !== 'All') query = query.eq('job_type', filters.type)
    const { data, error } = await query
    if (error) throw error
    return data || []
  }, swrConfig)
}

// Companies — cached
export function useCompanies() {
  return useSWR('companies', async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('followers_count', { ascending: false })
    if (error) throw error
    return data || []
  }, swrConfig)
}

// Messages/conversations — cached
export function useConversations(userId) {
  return useSWR(userId ? `conversations-${userId}` : null, async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(id,display_name,handle,is_live), receiver:profiles!messages_receiver_id_fkey(id,display_name,handle,is_live)')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }, { ...swrConfig, refreshInterval: 10000 }) // Refresh messages every 10s
}

// Network suggestions — cached
export function useSuggestions(userId) {
  return useSWR(userId ? `suggestions-${userId}` : null, async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, handle, category, platforms, bio')
      .neq('id', userId)
      .limit(12)
    if (error) throw error
    return data || []
  }, { ...swrConfig, revalidateOnFocus: false })
}

// Invalidate cache after mutations (e.g. after posting)
export const invalidate = (key) => mutate(key)
export const invalidatePosts = () => mutate('posts')
export const invalidateProfile = (userId) => mutate(`profile-${userId}`)
export const invalidateCompanies = () => mutate('companies')
