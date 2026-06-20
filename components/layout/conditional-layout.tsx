'use client'

import { usePathname } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { GlobalChatPanel } from '@/components/collaboration/global-chat-panel'
import { PageTransition } from '@/components/layout/page-transition'

const RUTAS_PUBLICAS = ['/', '/login', '/register']

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const esRutaPublica = RUTAS_PUBLICAS.includes(pathname)

  if (esRutaPublica) {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageTransition>{children}</PageTransition>
      </SidebarInset>
      <GlobalChatPanel />
    </SidebarProvider>
  )
}
