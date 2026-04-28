import { useEffect, useRef, useState } from 'react'
import useSWR, { mutate } from 'swr'
import { useTranslation } from 'react-i18next'
import { Heart, Image as ImageIcon, Loader2, MessageCircle, Share2, X } from 'lucide-react'
import { postApi, uploadApi, uploadFile } from '@/lib/api'
import { useAuthStore, useAppStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'
import { SkeletonPost, SkeletonProfile } from '@/components/ui/Skeleton'

// ── Fetcher ──
const fetchFeed = async () => {
  const result = await postApi.feed(undefined, 20)
  return result.items || []
}

// ── Likes modal ──
function LikesModal({ postId, onClose }) {
  const [likers, setLikers] = useState(null)
  useEffect(() => {
    let cancelled = false
    postApi.likes(postId, 50)
      .then((list) => { if (!cancelled) setLikers(list || []) })
      .catch(() => { if (!cancelled) setLikers([]) })
    return () => { cancelled = true }
  }, [postId])
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-[15px] font-extrabold">Liked by</h3>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
        <div className="p-3">
          {likers === null && <div className="text-center py-6 text-sm text-gray-400">Loading…</div>}
          {likers && likers.length === 0 && <div className="text-center py-6 text-sm text-gray-400">No likes yet</div>}
          {likers && likers.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                {p.avatarUrl ? <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" /> : (p.displayName || '??').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold truncate">{p.displayName}</div>
                <div className="text-[11px] text-gray-400">@{p.handle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Post Card ──
function PostCard({ post }) {
  const [liked, setLiked] = useState(Boolean(post.viewerHasLiked))
  const [count, setCount] = useState(post.likesCount || 0)
  const [showLikers, setShowLikers] = useState(false)
  const initials = post.author?.displayName?.slice(0, 2).toUpperCase() || '??'
  const timeAgo = post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ''

  const handleLike = async () => {
    const nextLiked = !liked
    setLiked(nextLiked)
    setCount(c => c + (nextLiked ? 1 : -1))
    try {
      const res = nextLiked ? await postApi.like(post.id) : await postApi.unlike(post.id)
      if (typeof res?.likesCount === 'number') setCount(res.likesCount)
    } catch {
      // revert on failure
      setLiked(!nextLiked)
      setCount(c => c + (nextLiked ? -1 : 1))
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
      <div className="flex gap-3 p-4 pb-0 items-start">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
          {post.author?.avatarUrl ? <img src={post.author.avatarUrl} alt="" className="w-full h-full object-cover" /> : initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13.5px] font-bold">{post.author?.displayName || 'Unknown'}</span>
            {post.author?.isLive && <span className="text-[9.5px] bg-live text-white font-black px-1.5 py-0.5 rounded-full">LIVE</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {post.author?.category && <span className="text-[11.5px] text-gray-400">{post.author.category}</span>}
            <span className="text-[11px] text-gray-300">{timeAgo}</span>
          </div>
        </div>
      </div>
      {post.content && (
        <div className="px-4 py-3">
          <p className="text-[13.5px] leading-relaxed text-gray-800 whitespace-pre-wrap">{post.content}</p>
        </div>
      )}
      {post.mediaUrl && (
        <div className="px-4 pb-3">
          <img
            src={post.mediaUrl}
            alt=""
            className="w-full max-h-[520px] rounded-xl border border-gray-100 object-cover cursor-zoom-in"
            onClick={() => window.open(post.mediaUrl, '_blank', 'noopener,noreferrer')}
          />
        </div>
      )}
      <div className="flex border-t border-gray-100">
        <button onClick={handleLike}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold transition hover:bg-gray-50 rounded-bl-xl
            ${liked ? 'text-live' : 'text-gray-500'}`}>
          <Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} strokeWidth={2.25} />
          <span onClick={(e) => { e.stopPropagation(); if (count > 0) setShowLikers(true) }} className={count > 0 ? 'hover:underline' : ''}>{count}</span>
        </button>
        <button className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold text-gray-500 hover:bg-gray-50 transition">
          <MessageCircle className="w-4 h-4" strokeWidth={2.25} /> {post.commentsCount || 0}
        </button>
        <button className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold text-gray-500 hover:bg-gray-50 transition rounded-br-xl">
          <Share2 className="w-4 h-4" strokeWidth={2.25} /> Share
        </button>
      </div>
      {showLikers && <LikesModal postId={post.id} onClose={() => setShowLikers(false)} />}
    </div>
  )
}

// ── Composer ──
function Composer() {
  const { t } = useTranslation()
  const [content, setContent] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [storageEnabled, setStorageEnabled] = useState(true)
  const inputRef = useRef(null)
  const { showToast } = useAppStore()
  const { profile } = useAuthStore()

  useEffect(() => {
    let cancelled = false
    uploadApi.status()
      .then((r) => { if (!cancelled) setStorageEnabled(Boolean(r?.enabled)) })
      .catch(() => { if (!cancelled) setStorageEnabled(false) })
    return () => { cancelled = true }
  }, [])

  const pickImage = () => inputRef.current?.click()
  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadFile({ file, kind: 'post' })
      setMediaUrl(url)
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error')
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handlePost = async () => {
    if (!content.trim() && !mediaUrl) return
    setLoading(true)
    try {
      await postApi.create({
        content: content.trim() || '',
        mediaUrl: mediaUrl || null,
        postType: mediaUrl ? 'clip' : 'text',
      })
      setContent('')
      setMediaUrl('')
      showToast(t('feed.posted'))
      mutate('feed')
    } catch (err) {
      showToast(err.message || 'Could not post', 'error')
    }
    setLoading(false)
  }

  const initials = profile?.displayName?.slice(0, 2).toUpperCase() || '??'

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
      <div className="flex gap-3 items-start mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
          {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" /> : initials}
        </div>
        <div className="flex-1">
          <textarea
            className="w-full min-h-[44px] max-h-32 bg-bg border border-gray-200 rounded-2xl px-4 py-2.5 text-[13px] outline-none focus:bg-white focus:border-accent transition resize-none"
            placeholder={t('feed.composerPlaceholder')}
            value={content}
            rows={1}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && !e.metaKey && (e.preventDefault(), handlePost())}
          />
          {mediaUrl && (
            <div className="mt-2 relative inline-block">
              <img src={mediaUrl} alt="Attached" className="max-h-48 rounded-xl border border-gray-200" />
              <button
                type="button"
                onClick={() => setMediaUrl('')}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition"
                aria-label="Remove image"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {storageEnabled && (
            <button
              type="button"
              onClick={pickImage}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] text-gray-500 hover:text-accent font-semibold transition rounded-full hover:bg-accent-lt disabled:opacity-50"
            >
              {uploading
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.25} /> {t('common.loading')}</>
                : <><ImageIcon className="w-3.5 h-3.5" strokeWidth={2.25} /> {t('feed.addImage')}</>}
            </button>
          )}
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onFile} />
        </div>
        <button onClick={handlePost} disabled={(!content.trim() && !mediaUrl) || loading}
          className="px-5 py-1.5 bg-accent hover:bg-accent-dk text-white text-[13px] font-bold rounded-full transition disabled:opacity-50 flex items-center gap-2">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} /> : null}
          Post
        </button>
      </div>
    </div>
  )
}

// ── Sidebar widgets ──
function ProfileSidebar({ profile }) {
  if (!profile) return <SkeletonProfile />
  const initials = profile.displayName?.slice(0, 2).toUpperCase() || '??'
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="h-14 bg-gradient-to-r from-accent/20 to-purple-100" />
      <div className="px-4 pb-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-purple-400 border-4 border-white -mt-7 flex items-center justify-center text-white font-extrabold text-lg mb-2">
          {initials}
        </div>
        <div className="font-extrabold text-[14px]">{profile.displayName}</div>
        <div className="text-[11.5px] text-gray-400 mb-3">@{profile.handle}{profile.category && ` · ${profile.category}`}</div>
        <div className="flex justify-between text-center border-t border-gray-100 pt-3">
          {[['Connections', profile.connectionsCount || 0], ['Followers', profile.followersCount || 0]].map(([k, v]) => (
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
  const { profile } = useAuthStore()

  // SWR — cached data, instant on re-visit
  const { data: posts, isLoading } = useSWR('feed', fetchFeed, { refreshInterval: 30000 })

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
          <Composer />
          {isLoading
            ? Array(4).fill(0).map((_, i) => <SkeletonPost key={i} />)
            : posts?.length === 0
              ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                  <div className="text-4xl mb-3">🎮</div>
                  <div className="font-bold text-gray-600">No posts yet — be the first!</div>
                </div>
              )
              : posts?.map(post => <PostCard key={post.id} post={post} />)
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
