import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { supabase } from '@/lib/supabase'
import { useAuthStore, useAppStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'
import { SkeletonPost, SkeletonProfile } from '@/components/ui/Skeleton'

// ── Fetchers ──
const fetchPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select('id, content, likes_count, comments_count, created_at, user_id, profiles(id, display_name, handle, category, is_live)')
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data || []
}

const fetchProfile = async (userId) => {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
  return data
}

// ── Post Card ──
function PostCard({ post, currentUserId }) {
  const [liked, setLiked] = useState(false)
  const initials = post.profiles?.display_name?.slice(0, 2).toUpperCase() || '??'
  const timeAgo = post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : ''

  const handleLike = async () => {
    // Optimistic update — feels instant
    setLiked(l => !l)
    mutate('posts', (posts) => posts?.map(p =>
      p.id === post.id ? { ...p, likes_count: (p.likes_count || 0) + (liked ? -1 : 1) } : p
    ), false)
    if (!liked) {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: currentUserId })
    } else {
      await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', currentUserId)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
      <div className="flex gap-3 p-4 pb-0 items-start">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13.5px] font-bold">{post.profiles?.display_name || 'Unknown'}</span>
            {post.profiles?.is_live && <span className="text-[9.5px] bg-live text-white font-black px-1.5 py-0.5 rounded-full">LIVE</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {post.profiles?.category && <span className="text-[11.5px] text-gray-400">{post.profiles.category}</span>}
            <span className="text-[11px] text-gray-300">{timeAgo}</span>
          </div>
        </div>
      </div>
      <div className="px-4 py-3">
        <p className="text-[13.5px] leading-relaxed text-gray-800">{post.content}</p>
      </div>
      <div className="flex border-t border-gray-100">
        <button onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold transition hover:bg-gray-50 rounded-bl-xl
            ${liked ? 'text-live' : 'text-gray-500'}`}>
          {liked ? '❤️' : '🤍'} {(post.likes_count || 0) + (liked ? 1 : 0)}
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold text-gray-500 hover:bg-gray-50 transition">
          💬 {post.comments_count || 0}
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold text-gray-500 hover:bg-gray-50 transition rounded-br-xl">
          ↗️ Share
        </button>
      </div>
    </div>
  )
}

// ── Composer ──
function Composer({ userId }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const { showToast } = useAppStore()
  const { profile } = useAuthStore()

  const handlePost = async () => {
    if (!content.trim()) return
    setLoading(true)
    const { error } = await supabase.from('posts').insert({ content: content.trim(), user_id: userId })
    if (error) showToast(error.message, 'error')
    else {
      setContent('')
      showToast('✅ Posted!')
      mutate('posts') // Refresh feed
    }
    setLoading(false)
  }

  const initials = profile?.display_name?.slice(0, 2).toUpperCase() || '??'

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
      <div className="flex gap-3 items-center mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <textarea
          className="flex-1 min-h-[44px] max-h-32 bg-bg border border-gray-200 rounded-2xl px-4 py-2.5 text-[13px] outline-none focus:bg-white focus:border-accent transition resize-none"
          placeholder="Share something with the community…"
          value={content}
          rows={1}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handlePost())}
        />
      </div>
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {['🎮 Clip', '📅 Schedule', '📊 Stats'].map(tag => (
            <button key={tag} onClick={() => setContent(c => c + ' ' + tag.split(' ')[0])}
              className="text-[11.5px] text-gray-400 hover:text-accent font-semibold transition">{tag}</button>
          ))}
        </div>
        <button onClick={handlePost} disabled={!content.trim() || loading}
          className="px-5 py-1.5 bg-accent hover:bg-accent-dk text-white text-[13px] font-bold rounded-full transition disabled:opacity-50 flex items-center gap-2">
          {loading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
          Post
        </button>
      </div>
    </div>
  )
}

// ── Sidebar widgets ──
function ProfileSidebar({ profile }) {
  if (!profile) return <SkeletonProfile />
  const initials = profile.display_name?.slice(0, 2).toUpperCase() || '??'
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="h-14 bg-gradient-to-r from-accent/20 to-purple-100" />
      <div className="px-4 pb-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-purple-400 border-4 border-white -mt-7 flex items-center justify-center text-white font-extrabold text-lg mb-2">
          {initials}
        </div>
        <div className="font-extrabold text-[14px]">{profile.display_name}</div>
        <div className="text-[11.5px] text-gray-400 mb-3">@{profile.handle}{profile.category && ` · ${profile.category}`}</div>
        <div className="flex justify-between text-center border-t border-gray-100 pt-3">
          {[['Connections', profile.connections_count || 0], ['Followers', profile.followers_count || 0]].map(([k, v]) => (
            <div key={k}>
              <div className="text-[15px] font-extrabold text-accent">{v}</div>
              <div className="text-[10px] text-gray-400">{k}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const LIVE_NOW = [
  { name: 'NinjaStreams', viewers: '12.4K', game: 'Valorant' },
  { name: 'PixelKnight', viewers: '8.2K', game: 'Fortnite' },
  { name: 'StarCaster', viewers: '5.1K', game: 'Just Chatting' },
]
const TAGS = ['#FPS', '#JustChatting', '#Valorant', '#Minecraft', '#IRL', '#Music']

// ── Main Page ──
export default function FeedPage() {
  const { user, profile } = useAuthStore()

  // SWR — cached data, instant on re-visit
  const { data: posts, isLoading } = useSWR('posts', fetchPosts, { refreshInterval: 30000 })

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-5">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_280px] gap-4">

        {/* Left sidebar — desktop only */}
        <aside className="hidden md:block space-y-3">
          <ProfileSidebar profile={profile} />
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <div className="text-[12.5px] font-extrabold text-gray-500 uppercase tracking-wider mb-3">Trending Tags</div>
            <div className="flex flex-wrap gap-1.5">
              {TAGS.map(t => (
                <span key={t} className="text-[11.5px] text-accent bg-accent-lt font-bold px-2.5 py-1 rounded-full cursor-pointer hover:bg-accent hover:text-white transition">{t}</span>
              ))}
            </div>
          </div>
        </aside>

        {/* Feed */}
        <main className="space-y-3">
          <Composer userId={user?.id} />
          {isLoading
            ? Array(4).fill(0).map((_, i) => <SkeletonPost key={i} />)
            : posts?.length === 0
              ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                  <div className="text-4xl mb-3">🎮</div>
                  <div className="font-bold text-gray-600">No posts yet — be the first!</div>
                </div>
              )
              : posts?.map(post => <PostCard key={post.id} post={post} currentUserId={user?.id} />)
          }
        </main>

        {/* Right sidebar — desktop only */}
        <aside className="hidden md:block space-y-3 sticky top-20">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <div className="w-2 h-2 bg-live rounded-full animate-pulse" />
              <span className="text-[12.5px] font-extrabold">Live Now</span>
            </div>
            {LIVE_NOW.map(s => (
              <div key={s.name} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-live to-red-400 flex items-center justify-center text-white font-bold text-xs">
                  {s.name.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold">{s.name}</div>
                  <div className="text-[10.5px] text-gray-400">{s.game} · {s.viewers}</div>
                </div>
                <div className="w-1.5 h-1.5 bg-live rounded-full" />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
