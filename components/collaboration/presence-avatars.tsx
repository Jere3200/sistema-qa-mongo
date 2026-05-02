'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth/auth-provider'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface PresenceUser {
  userId: string
  nombre: string
  onlineAt: string
}

interface PresenceAvatarsProps {
  projectId: string
}

export function PresenceAvatars({ projectId }: PresenceAvatarsProps) {
  const { sesion } = useAuth()
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([])

  useEffect(() => {
    if (!sesion) return

    const supabase = createClient()
    const channel = supabase.channel(`presence:${projectId}`, {
      config: { presence: { key: sesion.id } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceUser>()
        const users: PresenceUser[] = Object.values(state)
          .flat()
          .filter((u) => u.userId !== sesion.id)
        setOnlineUsers(users)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: sesion.id,
            nombre: sesion.nombre,
            onlineAt: new Date().toISOString(),
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, sesion])

  if (onlineUsers.length === 0) return null

  return (
    <TooltipProvider>
      <div className="flex items-center -space-x-2">
        {onlineUsers.slice(0, 5).map((user) => (
          <Tooltip key={user.userId}>
            <TooltipTrigger asChild>
              <div
                className="size-8 rounded-full bg-teal-500 border-2 border-background flex items-center justify-center text-xs font-semibold text-white cursor-default"
                aria-label={user.nombre}
              >
                {user.nombre.charAt(0).toUpperCase()}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="text-xs">{user.nombre} — en línea</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {onlineUsers.length > 5 && (
          <div className="size-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-semibold text-muted-foreground">
            +{onlineUsers.length - 5}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
