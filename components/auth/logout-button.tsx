'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@heroui/react'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  async function handleLogout() {
    await signOut({ redirect: false })
    window.location.assign('/login')
  }

  return (
    <Button
      onPress={handleLogout}
      color="danger"
      variant="flat"
      startContent={<LogOut className="size-4" />}
    >
      Cerrar sesión
    </Button>
  )
}
