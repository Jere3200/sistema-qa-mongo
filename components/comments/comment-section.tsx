'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Send, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { getComments, addComment, deleteComment } from '@/lib/db/comments'
import type { Comment } from '@/lib/db/comments'
import { getAvatarColor, getAvatarInitial } from '@/lib/utils/avatar-color'
import { useAuth } from '@/components/auth/auth-provider'

interface CommentSectionProps {
  userStoryId?: string
  testCaseId?: string
}

export function CommentSection({ userStoryId, testCaseId }: CommentSectionProps) {
  const { sesion } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [content, setContent] = useState('')
  const [isSending, setIsSending] = useState(false)

  const load = async () => {
    try {
      const data = await getComments({ userStoryId, testCaseId })
      setComments(data)
    } catch {
      toast.error('Error al cargar los comentarios')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [userStoryId, testCaseId])

  const handleSend = async () => {
    if (!content.trim()) return
    setIsSending(true)
    try {
      await addComment({ userStoryId, testCaseId, content })
      setContent('')
      await load()
    } catch {
      toast.error('Error al enviar el comentario')
    } finally {
      setIsSending(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteComment(id)
      setComments((prev) => prev.filter((c) => c.id !== id))
    } catch {
      toast.error('Error al eliminar el comentario')
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="size-4 text-muted-foreground" />
          Comentarios
          {comments.length > 0 && (
            <span className="text-xs font-normal text-muted-foreground">({comments.length})</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay comentarios aún. Sé el primero en comentar.
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => {
              const { bg, text } = getAvatarColor(comment.authorName)
              const isOwn = sesion?.id === comment.userId
              return (
                <div key={comment.id} className="flex gap-3">
                  <div className={`size-8 rounded-full ${bg} ${text} flex items-center justify-center text-sm font-semibold shrink-0`}>
                    {getAvatarInitial(comment.authorName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{comment.authorName}</span>
                        <span className="text-xs text-muted-foreground">
                          {comment.createdAt.toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {isOwn && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(comment.id)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Textarea
            placeholder="Escribe un comentario..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSend()
            }}
            className="min-h-[80px] resize-none text-sm"
          />
          <Button
            onClick={handleSend}
            disabled={!content.trim() || isSending}
            size="icon"
            className="self-end shrink-0"
          >
            <Send className="size-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Ctrl+Enter para enviar</p>
      </CardContent>
    </Card>
  )
}
