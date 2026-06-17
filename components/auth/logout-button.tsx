'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@heroui/react'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  return (
    <Button
      onPress={() => signOut({ callbackUrl: '/login' })}
      color="danger"
      variant="flat"
      startContent={<LogOut className="size-4" />}
    >
      Cerrar sesión
    </Button>
  )
}
