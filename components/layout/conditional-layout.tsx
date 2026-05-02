'use client'

import { usePathname } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

// Rutas que NO muestran el sidebar (páginas públicas)
const RUTAS_PUBLICAS = ['/', '/login', '/register']

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const esRutaPublica = RUTAS_PUBLICAS.includes(pathname)

  // Páginas públicas: sin sidebar, sin wrapper
  if (esRutaPublica) {
    return <>{children}</>
  }

  // Páginas protegidas: con sidebar completo
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
