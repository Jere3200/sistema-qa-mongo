'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

import { getGlobalMessages, sendGlobalMessage, subscribeToGlobalMessages } from '@/lib/db/global-chat'
import { useAuth } from '@/components/auth/auth-provider'
import type { GlobalMessage } from '@/lib/db/global-chat'

export function GlobalChatPanel() {
  const { sesion } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<GlobalMessage[]>([])
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sesion) return

    getGlobalMessages()
      .then(setMessages)
      .catch(() => toast.error('Error al cargar el chat'))

    const unsub = subscribeToGlobalMessages((msg) => {
      setMessages((prev) => [...prev, msg])
      if (!open) setUnread((n) => n + 1)
    })
    return unsub
  }, [sesion])

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || isSending) return
    setIsSending(true)
    try {
      await sendGlobalMessage(text.trim())
      setText('')
    } catch {
      toast.error('Error al enviar el mensaje')
    } finally {
      setIsSending(false)
    }
  }

  if (!sesion) return null

  return (
    <>
      {open && (
        <div className="fixed bottom-20 left-6 w-80 bg-background border border-border rounded-xl shadow-xl flex flex-col z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-teal-600" />
              <h3 className="text-sm font-semibold">Chat General</h3>
            </div>
            <Button variant="ghost" size="icon" className="size-6" onClick={() => setOpen(false)}>
              <X className="size-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 h-72 px-4 py-3">
            <div className="space-y-3">
              {messages.map((msg) => {
                const isOwn = msg.userId === sesion.id
                return (
                  <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                    {!isOwn && (
                      <span className="text-xs text-muted-foreground mb-1">{msg.userName}</span>
                    )}
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
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
                  No hay mensajes aún. ¡Empezá la conversación!
                </p>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <div className="flex items-center gap-2 px-3 py-2 border-t">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="Escribe un mensaje..."
              className="h-8 text-sm"
              disabled={isSending}
            />
            <Button
              size="icon"
              className="size-8 shrink-0"
              onClick={handleSend}
              disabled={!text.trim() || isSending}
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 left-6 z-50 size-12 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg flex items-center justify-center transition-colors"
        aria-label="Chat general"
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
