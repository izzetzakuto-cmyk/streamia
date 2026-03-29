import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore, useAppStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'

const initials = (name) => name?.slice(0, 2).toUpperCase() || '??'

export default function MessagesPage() {
  const { profile } = useAuthStore()
  const { showToast } = useAppStore()
  const [conversations, setConversations] = useState([])
  const [activeConvo, setActiveConvo] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewDM, setShowNewDM] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  const fetchConversations = async () => {
    if (!profile) return
    const { data, error } = await supabase
      .from('messages')
      .select(`*, sender:profiles!messages_sender_id_fkey(id,display_name,handle,is_live), receiver:profiles!messages_receiver_id_fkey(id,display_name,handle,is_live)`)
      .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
      .order('created_at', { ascending: false })

    if (!error && data) {
      const convMap = {}
      data.forEach(msg => {
        const partner = msg.sender_id === profile.id ? msg.receiver : msg.sender
        if (!partner) return
        if (!convMap[partner.id]) convMap[partner.id] = { partner, lastMessage: msg, unread: 0 }
        if (!msg.is_read && msg.receiver_id === profile.id) convMap[partner.id].unread++
      })
      setConversations(Object.values(convMap))
    }
    setLoading(false)
  }

  const fetchMessages = async (partnerId) => {
    if (!profile) return
    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(id,display_name,handle)')
      .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${profile.id})`)
      .order('created_at', { ascending: true })
    setMessages(data || [])
    await supabase.from('messages').update({ is_read: true }).eq('receiver_id', profile.id).eq('sender_id', partnerId)
    setTimeout(scrollToBottom, 100)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConvo || sending) return
    setSending(true)
    const { error } = await supabase.from('messages').insert({
      sender_id: profile.id,
      receiver_id: activeConvo.partner.id,
      content: newMessage.trim(),
    })
    if (error) showToast(error.message, 'error')
    else { setNewMessage(''); fetchMessages(activeConvo.partner.id); fetchConversations() }
    setSending(false)
  }

  const searchPeople = async (q) => {
    if (!q.trim()) { setSearchResults([]); return }
    const { data } = await supabase.from('profiles').select('id,display_name,handle,category').neq('id', profile?.id).ilike('display_name', `%${q}%`).limit(10)
    setSearchResults(data || [])
  }

  const startNewDM = (p) => {
    setActiveConvo({ partner: p, lastMessage: null, unread: 0 })
    setShowNewDM(false)
    setSearchResults([])
    fetchMessages(p.id)
  }

  useEffect(() => { fetchConversations() }, [profile])

  useEffect(() => {
    if (!activeConvo) return
    fetchMessages(activeConvo.partner.id)
    const channel = supabase.channel(`dm-${activeConvo.partner.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
        fetchMessages(activeConvo.partner.id); fetchConversations()
      }).subscribe()
    return () => supabase.removeChannel(channel)
  }, [activeConvo?.partner?.id])

  const filtered = conversations.filter(c => c.partner.display_name?.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-5">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex" style={{ height: 'calc(100dvh - 130px)' }}>

        {/* LEFT sidebar */}
        <div className="w-full md:w-[300px] border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[16px] font-extrabold">Messages</h2>
              <button onClick={() => setShowNewDM(true)} className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xl font-bold hover:bg-accent-dk transition">+</button>
            </div>
            <input type="text" placeholder="🔍 Search…"
              className="w-full h-9 bg-bg border border-gray-200 rounded-full px-4 text-[12.5px] outline-none focus:border-accent"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
              : filtered.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="text-3xl mb-2">💬</div>
                  <div className="text-sm font-bold text-gray-600 mb-1">No messages yet</div>
                  <div className="text-xs text-gray-400">Click + to start a conversation</div>
                </div>
              ) : filtered.map(convo => (
                <div key={convo.partner.id} onClick={() => setActiveConvo(convo)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-50
                    ${activeConvo?.partner.id === convo.partner.id ? 'bg-accent-lt border-l-[3px] border-l-accent' : ''}`}>
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white font-bold text-sm">{initials(convo.partner.display_name)}</div>
                    {convo.partner.is_live && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-live rounded-full border-2 border-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className={`text-[13px] truncate ${convo.unread > 0 ? 'font-extrabold' : 'font-semibold'}`}>{convo.partner.display_name}</span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">{formatDistanceToNow(new Date(convo.lastMessage.created_at))}</span>
                    </div>
                    <div className={`text-[11.5px] truncate ${convo.unread > 0 ? 'text-gray-700 font-semibold' : 'text-gray-400'}`}>{convo.lastMessage?.content}</div>
                  </div>
                  {convo.unread > 0 && <div className="w-5 h-5 bg-accent rounded-full text-white text-[9px] font-black flex items-center justify-center flex-shrink-0">{convo.unread}</div>}
                </div>
              ))}
          </div>
        </div>

        {/* RIGHT chat */}
        {activeConvo ? (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white font-bold text-sm">{initials(activeConvo.partner.display_name)}</div>
              <div>
                <div className="text-[14px] font-extrabold">{activeConvo.partner.display_name}</div>
                <div className="text-[11px] text-gray-400">@{activeConvo.partner.handle} {activeConvo.partner.is_live && <span className="text-live font-bold ml-1">● LIVE</span>}</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-3xl mb-2">👋</div>
                  <div className="text-sm text-gray-400">Say hi to {activeConvo.partner.display_name}!</div>
                </div>
              )}
              {messages.map(msg => {
                const isMe = msg.sender_id === profile?.id
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed
                      ${isMe ? 'bg-accent text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                      {msg.content}
                      <div className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
              <input type="text" placeholder={`Message ${activeConvo.partner.display_name}…`}
                className="flex-1 h-10 bg-bg border border-gray-200 rounded-full px-4 text-[13px] outline-none focus:border-accent focus:bg-white transition"
                value={newMessage} onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()} />
              <button onClick={sendMessage} disabled={!newMessage.trim() || sending}
                className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-accent-dk transition text-base">➤</button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-3">
            <div className="text-5xl">💬</div>
            <div className="text-lg font-extrabold text-gray-700">Your Messages</div>
            <div className="text-sm text-gray-400">Select a conversation or start a new one</div>
            <button onClick={() => setShowNewDM(true)} className="mt-2 px-5 py-2 bg-accent text-white font-bold rounded-full text-sm hover:bg-accent-dk transition">+ New Message</button>
          </div>
        )}
      </div>

      {/* New DM modal */}
      {showNewDM && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowNewDM(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-[16px]">New Message</h3>
              <button onClick={() => setShowNewDM(false)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
            </div>
            <input type="text" placeholder="🔍 Search streamers…"
              className="w-full h-10 bg-bg border border-gray-200 rounded-full px-4 text-sm outline-none focus:border-accent mb-3"
              onChange={e => searchPeople(e.target.value)} />
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {searchResults.map(p => (
                <div key={p.id} onClick={() => startNewDM(p)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white font-bold text-xs">{initials(p.display_name)}</div>
                  <div>
                    <div className="text-[13px] font-bold">{p.display_name}</div>
                    <div className="text-[11px] text-gray-400">@{p.handle} · {p.category}</div>
                  </div>
                </div>
              ))}
              {searchResults.length === 0 && <div className="text-center py-4 text-sm text-gray-400">Type to search for streamers</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
