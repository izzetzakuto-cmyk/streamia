import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore, useAppStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'

function PostCard({ post, onLike }) {
  const [liked, setLiked] = useState(false)

  const handleLike = () => {
    setLiked(!liked)
    onLike(post.id, liked)
  }

  const initials = post.profiles?.display_name?.slice(0, 2).toUpperCase() || 'UN'
  const timeAgo = post.created_at
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
    : ''

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
      {/* Post header */}
      <div className="flex gap-3 p-4 pb-0 items-start">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13.5px] font-bold">{post.profiles?.display_name || 'Unknown'}</div>
          <div className="flex items-center gap-2 mt-0.5">
            {post.profiles?.category && (
              <span className="text-[11.5px] text-gray-400">{post.profiles.category}</span>
            )}
            <span className="text-[11px] text-gray-300">{timeAgo}</span>
          </div>
        </div>
      </div>

      {/* Post body */}
      <div className="px-4 py-3">
        <p className="text-[13.5px] leading-relaxed text-gray-800">{post.content}</p>
      </div>

      {/* Actions */}
      <div className="flex border-t border-gray-100">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold transition hover:bg-gray-50
            ${liked ? 'text-live' : 'text-gray-500'}`}
        >
          {liked ? '❤️' : '🤍'} {(post.likes_count || 0) + (liked ? 1 : 0)}
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold text-gray-500 hover:bg-gray-50 transition">
          💬 {post.comments_count || 0}
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold text-gray-500 hover:bg-gray-50 transition">
          ↗️ Share
        </button>
      </div>
    </div>
  )
}

function Composer({ onPost }) {
  const { profile } = useAuthStore()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const { showToast } = useAppStore()

  const handlePost = async () => {
    if (!content.trim()) return
    setLoading(true)
    const { error } = await supabase.from('posts').insert({ content: content.trim() })
    if (error) showToast(error.message, 'error')
    else {
      showToast('✅ Post shared!')
      setContent('')
      onPost()
    }
    setLoading(false)
  }

  const initials = profile?.display_name?.slice(0, 2).toUpperCase() || 'ME'

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
      <div className="flex gap-3 items-center mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <input
          type="text"
          placeholder="Share a clip, milestone, or collab request…"
          className="flex-1 h-10 bg-bg border border-gray-200 rounded-full px-4 text-[13px] outline-none focus:bg-white focus:border-accent transition"
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handlePost()}
        />
      </div>
      <div className="border-t border-gray-100 pt-2 flex justify-end">
        <button
          onClick={handlePost} disabled={loading || !content.trim()}
          className="px-5 py-1.5 bg-accent hover:bg-accent-dk text-white text-[13px] font-bold rounded-full transition disabled:opacity-50"
        >
          {loading ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  )
}

export default function FeedPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useAppStore()

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`*, profiles(display_name, handle, category, platforms)`)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) showToast(error.message, 'error')
    else setPosts(data || [])
    setLoading(false)
  }

  const handleLike = async (postId, wasLiked) => {
    await supabase.from('post_likes').upsert({ post_id: postId })
  }

  useEffect(() => {
    fetchPosts()

    // Real-time subscription
    const channel = supabase
      .channel('posts-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, fetchPosts)
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-5">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr_280px] gap-4">

        {/* Left sidebar */}
        <aside className="hidden md:block space-y-3">
          <ProfileSidebar />
          <TrendingTags />
        </aside>

        {/* Feed */}
        <main className="space-y-3">
          <Composer onPost={fetchPosts} />
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <div className="text-4xl mb-3">🎙️</div>
              <div className="font-bold text-gray-800 mb-1">No posts yet</div>
              <div className="text-sm text-gray-400">Be the first to post something!</div>
            </div>
          ) : (
            posts.map(post => <PostCard key={post.id} post={post} onLike={handleLike} />)
          )}
        </main>

        {/* Right sidebar */}
        <aside className="hidden md:block space-y-3">
          <LiveNow />
          <PeopleYouMayKnow />
        </aside>
      </div>
    </div>
  )
}

function ProfileSidebar() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const initials = profile?.display_name?.slice(0, 2).toUpperCase() || 'ME'

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="h-14 bg-gradient-to-r from-purple-100 to-blue-100" />
      <div className="px-4 pb-4">
        <div
          className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-purple-400 border-[3px] border-white -mt-7 flex items-center justify-center text-white font-extrabold text-lg cursor-pointer"
          onClick={() => navigate('/profile')}
        >{initials}</div>
        <div className="mt-2 font-bold text-[14px] cursor-pointer hover:text-accent" onClick={() => navigate('/profile')}>
          {profile?.display_name || 'Your Name'}
        </div>
        <div className="text-[11px] text-gray-400">@{profile?.handle || 'yourhandle'}</div>
        <div className="text-[11.5px] text-gray-500 mt-2 line-clamp-2">{profile?.bio || 'Add a bio to your profile'}</div>
        <div className="flex border-t border-gray-100 mt-3 -mx-4">
          {[['Connections', '0'], ['Followers', '0'], ['Collabs', '0']].map(([l, n]) => (
            <div key={l} className="flex-1 text-center py-2 cursor-pointer hover:bg-gray-50 transition">
              <div className="text-[14px] font-extrabold">{n}</div>
              <div className="text-[9.5px] text-gray-400">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TrendingTags() {
  const tags = [['#Valorant','4,821'],['#JustChatting','3,590'],['#ColabRequest','2,104'],['#StreamSetup','1,887'],['#NewStreamer','1,204']]
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Trending Tags</div>
      {tags.map(([tag, ct]) => (
        <div key={tag} className="flex justify-between items-center py-1.5 cursor-pointer hover:text-accent transition border-b border-gray-50 last:border-0">
          <span className="text-[12.5px] font-medium">{tag}</span>
          <span className="text-[11px] text-gray-400">{ct}</span>
        </div>
      ))}
    </div>
  )
}

function LiveNow() {
  const streamers = [
    { init:'SV', name:'ShadowViper', cat:'Resident Evil 4', viewers:'12.4K', bg:'from-purple-600 to-purple-800' },
    { init:'NX', name:'NeonXtra',    cat:'Valorant',        viewers:'8.1K',  bg:'from-green-500 to-green-700', dark:true },
    { init:'CR', name:'CosmicRay',   cat:'Just Chatting',   viewers:'5.8K',  bg:'from-orange-500 to-red-600' },
    { init:'LS', name:'LunaStream',  cat:'Music & Chill',   viewers:'2.9K',  bg:'from-purple-400 to-pink-600' },
  ]
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <div className="w-2 h-2 rounded-full bg-live animate-pulse" />
        <span className="text-[13.5px] font-bold">Live now</span>
        <span className="ml-auto text-[11px] text-gray-400">8,340</span>
      </div>
      {streamers.map(s => (
        <div key={s.name} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition">
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${s.bg} flex items-center justify-center font-bold text-[11px] ${s.dark ? 'text-gray-900' : 'text-white'} ring-2 ring-live/50`}>
            {s.init}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold truncate">{s.name}</div>
            <div className="text-[11px] text-gray-400 truncate">{s.cat}</div>
          </div>
          <span className="text-[11px] text-gray-400 font-semibold">{s.viewers}</span>
        </div>
      ))}
    </div>
  )
}

function PeopleYouMayKnow() {
  const { showToast } = useAppStore()
  const people = [
    { init:'GR', name:'GoldRush',   sub:'🟣 Twitch · 3 mutual', bg:'from-yellow-400 to-amber-600' },
    { init:'VP', name:'VixenPlays', sub:'🟢 Kick · 7 mutual',   bg:'from-pink-500 to-rose-600' },
    { init:'BF', name:'ByteForge',  sub:'🔴 YouTube · 2 mutual',bg:'from-cyan-500 to-blue-600' },
  ]
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 text-[13.5px] font-bold">People you may know</div>
      {people.map(p => (
        <div key={p.name} className="flex items-center gap-3 px-4 py-2.5">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${p.bg} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
            {p.init}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold">{p.name}</div>
            <div className="text-[11px] text-gray-400">{p.sub}</div>
          </div>
          <button
            onClick={() => showToast(`✅ Request sent to ${p.name}!`)}
            className="text-[12px] font-bold text-accent border border-accent rounded-full px-3 py-1 hover:bg-accent hover:text-white transition"
          >+ Connect</button>
        </div>
      ))}
    </div>
  )
}
