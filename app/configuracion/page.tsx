'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, Shield, Moon, Sun, Monitor, Trash2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/components/auth/auth-provider'
import { getAvatarColor, getAvatarInitial } from '@/lib/utils/avatar-color'
import { deleteAccount } from '@/lib/actions/delete-account'

export default function ConfiguracionPage() {
  const { sesion, cerrarSesion } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleLogout = async () => {
    await cerrarSesion()
    toast.success('Sesión cerrada')
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    const { error } = await deleteAccount()
    if (error) {
      toast.error(error)
      setIsDeleting(false)
      return
    }
    await cerrarSesion()
    toast.success('Cuenta eliminada')
    router.push('/')
  }

  const avatarColor = sesion ? getAvatarColor(sesion.nombre) : { bg: 'bg-teal-500', text: 'text-white' }
  const deleteConfirmValid = deleteConfirmText === 'ELIMINAR'

  return (
    <>
      <AppHeader breadcrumbs={[{ label: 'Configuración' }]} />
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Configuración</h1>
            <p className="text-muted-foreground">Administrá tu cuenta y preferencias</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="size-4" />
                Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sesion ? (
                <div className="flex items-center gap-4">
                  <div className={`size-14 rounded-full flex items-center justify-center text-xl font-bold ${avatarColor.bg} ${avatarColor.text}`}>
                    {getAvatarInitial(sesion.nombre)}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{sesion.nombre}</p>
                    <p className="text-sm text-muted-foreground">{sesion.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay sesión activa</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Monitor className="size-4" />
                Apariencia
              </CardTitle>
              <CardDescription>Elegí el tema de la interfaz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {[
                  { value: 'light', label: 'Claro', icon: Sun },
                  { value: 'dark', label: 'Oscuro', icon: Moon },
                  { value: 'system', label: 'Sistema', icon: Monitor },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`flex flex-col items-center gap-2 px-5 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      theme === value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <Icon className="size-5" />
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-destructive">
                <Shield className="size-4" />
                Zona de peligro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Cerrar sesión</p>
                  <p className="text-xs text-muted-foreground">Salir de tu cuenta en este dispositivo</p>
                </div>
                <Button variant="destructive" onClick={() => setLogoutDialogOpen(true)}>
                  <LogOut className="mr-2 size-4" />
                  Cerrar sesión
                </Button>
              </div>

              <div className="border-t pt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Eliminar cuenta</p>
                  <p className="text-xs text-muted-foreground">
                    Elimina permanentemente tu cuenta y todos tus datos
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => { setDeleteConfirmText(''); setDeleteDialogOpen(true) }}
                >
                  <Trash2 className="mr-2 size-4" />
                  Eliminar cuenta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>¿Cerrar sesión?</DialogTitle>
            <DialogDescription>
              Vas a salir de tu cuenta. Podés volver a ingresar en cualquier momento.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 size-4" />
              Cerrar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Eliminar cuenta</DialogTitle>
            <DialogDescription>
              Esta acción es <strong>irreversible</strong>. Se eliminarán permanentemente tu cuenta
              y todos tus datos asociados.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">
              Para confirmar, escribí <strong className="text-foreground">ELIMINAR</strong> en el campo de abajo:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="ELIMINAR"
              className="font-mono"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={!deleteConfirmValid || isDeleting}
            >
              <Trash2 className="mr-2 size-4" />
              {isDeleting ? 'Eliminando...' : 'Eliminar cuenta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
