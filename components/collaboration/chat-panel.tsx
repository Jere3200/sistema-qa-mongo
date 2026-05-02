'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Send } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

import { getMessages, sendMessage, subscribeToMessages } from '@/lib/store'
import { useAuth } from '@/components/auth/auth-provider'
import type { ChatMessage } from '@/lib/db/chat'

interface ChatPanelProps {
  projectId: string
  onClose: () => void
}

export function ChatPanel({ projectId, onClose }: ChatPanelProps) {
  const { sesion } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getMessages(projectId)
      .then(setMessages)
      .catch(() => toast.error('Error al cargar el chat'))

    const unsub = subscribeToMessages(projectId, (msg) => {
      setMessages((prev) => [...prev, msg])
    })
    return unsub
  }, [projectId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || isSending) return
    setIsSending(true)
    try {
      await sendMessage(projectId, text.trim())
      setText('')
    } catch {
      toast.error('Error al enviar el mensaje')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-background border border-border rounded-xl shadow-xl flex flex-col z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <h3 className="text-sm font-semibold">Chat del proyecto</h3>
        <Button variant="ghost" size="icon" className="size-6" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 h-72 px-4 py-3">
        <div className="space-y-3">
          {messages.map((msg) => {
            const isOwn = msg.userId === sesion?.id
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
            <p className="text-xs text-muted-foreground text-center py-4">
              No hay mensajes aún. ¡Sé el primero en escribir!
            </p>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="flex items-center gap-2 px-3 py-2 border-t">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
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
  )
}
