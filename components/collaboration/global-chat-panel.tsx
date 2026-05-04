'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageSquare, X, Send, ArrowLeft, Search, User } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

import {
  searchUsers,
  getConversations,
  getDMMessages,
  sendDMMessage,
  subscribeToDMs,
} from '@/lib/db/direct-messages'
import { useAuth } from '@/components/auth/auth-provider'
import type { DMMessage, DMConversation, UserProfile } from '@/lib/db/direct-messages'

type View = 'list' | 'chat'

export function GlobalChatPanel() {
  const { sesion } = useAuth()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('list')
  const [unread, setUnread] = useState(0)

  // list view
  const [conversations, setConversations] = useState<DMConversation[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // chat view
  const [chatUser, setChatUser] = useState<{ id: string; nombre: string } | null>(null)
  const [messages, setMessages] = useState<DMMessage[]>([])
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadConversations = useCallback(async () => {
    if (!sesion) return
    try {
      const convs = await getConversations()
      setConversations(convs)
    } catch {
      /* silent */
    }
  }, [sesion])

  useEffect(() => {
    if (!sesion) return
    loadConversations()
    const unsub = subscribeToDMs(sesion.id, (msg) => {
      setMessages((prev) => {
        if (view === 'chat' && chatUser?.id === msg.fromUserId) return [...prev, msg]
        return prev
      })
      loadConversations()
      if (!open || view !== 'chat' || chatUser?.id !== msg.fromUserId) {
        setUnread((n) => n + 1)
      }
    })
    return unsub
  }, [sesion, open, view, chatUser])

  useEffect(() => {
    if (open) setUnread(0)
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await searchUsers(searchQuery)
        setSearchResults(results)
      } catch {
        /* silent */
      } finally {
        setIsSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const openChat = async (user: { id: string; nombre: string }) => {
    setChatUser(user)
    setView('chat')
    setMessages([])
    setText('')
    try {
      const msgs = await getDMMessages(user.id)
      setMessages(msgs)
    } catch {
      toast.error('Error al cargar mensajes')
    }
  }

  const handleSend = async () => {
    if (!text.trim() || !chatUser || isSending) return
    setIsSending(true)
    const optimistic: DMMessage = {
      id: `tmp-${Date.now()}`,
      fromUserId: sesion?.id ?? '',
      toUserId: chatUser.id,
      fromUserName: sesion?.nombre ?? '',
      content: text.trim(),
      createdAt: new Date(),
    }
    setMessages((prev) => [...prev, optimistic])
    setText('')
    try {
      const sent = await sendDMMessage(chatUser.id, optimistic.content)
      setMessages((prev) => prev.map((m) => m.id === optimistic.id ? sent : m))
      loadConversations()
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      toast.error('Error al enviar el mensaje')
    } finally {
      setIsSending(false)
    }
  }

  const goBack = () => {
    setView('list')
    setChatUser(null)
    setSearchQuery('')
    setSearchResults([])
    loadConversations()
  }

  if (!sesion) return null

  const showSearch = searchQuery.trim().length > 0
  const listItems = showSearch ? searchResults : conversations

  return (
    <>
      {open && (
        <div className="fixed bottom-20 left-6 w-80 bg-background border border-border rounded-xl shadow-xl flex flex-col z-50 overflow-hidden" style={{ height: '420px' }}>

          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30 shrink-0">
            {view === 'chat' && (
              <Button variant="ghost" size="icon" className="size-6 shrink-0" onClick={goBack}>
                <ArrowLeft className="size-4" />
              </Button>
            )}
            <MessageSquare className="size-4 text-teal-600 shrink-0" />
            <h3 className="text-sm font-semibold truncate flex-1">
              {view === 'chat' ? chatUser?.nombre : 'Mensajes'}
            </h3>
            <Button variant="ghost" size="icon" className="size-6 shrink-0" onClick={() => setOpen(false)}>
              <X className="size-4" />
            </Button>
          </div>

          {/* List view */}
          {view === 'list' && (
            <>
              <div className="px-3 pt-3 pb-2 shrink-0">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar usuarios..."
                    className="pl-8 h-8 text-sm"
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="px-2 pb-2 space-y-0.5">
                  {isSearching && (
                    <p className="text-xs text-muted-foreground text-center py-4">Buscando...</p>
                  )}
                  {!isSearching && showSearch && searchResults.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">Sin resultados</p>
                  )}
                  {!isSearching && !showSearch && conversations.length === 0 && (
                    <div className="text-center py-8 space-y-1">
                      <User className="size-8 text-muted-foreground mx-auto" />
                      <p className="text-xs text-muted-foreground">
                        Buscá un usuario para empezar una conversación
                      </p>
                    </div>
                  )}
                  {!isSearching && listItems.map((item) => {
                    const isConv = !showSearch && 'lastMessage' in item
                    const id = isConv ? (item as DMConversation).userId : (item as UserProfile).id
                    const nombre = item.nombre
                    const sub = isConv ? (item as DMConversation).lastMessage : (item as UserProfile).email
                    return (
                      <button
                        key={id}
                        onClick={() => openChat({ id, nombre })}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="size-8 rounded-full bg-teal-100 flex items-center justify-center text-sm font-semibold text-teal-700 shrink-0">
                          {nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{nombre}</p>
                          <p className="text-xs text-muted-foreground truncate">{sub}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            </>
          )}

          {/* Chat view */}
          {view === 'chat' && (
            <>
              <ScrollArea className="flex-1 px-4 py-3">
                <div className="space-y-3">
                  {messages.map((msg) => {
                    const isOwn = msg.fromUserId === sesion.id
                    return (
                      <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                          {msg.content}
                        </div>
                        <span className="text-xs text-muted-foreground mt-0.5">
                          {msg.createdAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )
                  })}
                  {messages.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      Iniciá la conversación con {chatUser?.nombre}
                    </p>
                  )}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>
              <div className="flex items-center gap-2 px-3 py-2 border-t shrink-0">
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder="Escribe un mensaje..."
                  className="h-8 text-sm"
                  disabled={isSending}
                  autoFocus
                />
                <Button size="icon" className="size-8 shrink-0" onClick={handleSend} disabled={!text.trim() || isSending}>
                  <Send className="size-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 left-6 z-50 size-12 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg flex items-center justify-center transition-colors"
        aria-label="Mensajes"
      >
        <MessageSquare className="size-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 size-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </>
  )
}
