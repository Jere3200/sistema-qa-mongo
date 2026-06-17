'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Users as UsersIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

import { deleteUser } from '@/lib/actions/users-actions'
import { UserDrawer } from './user-drawer'

export interface UserListItem {
  id: string
  name: string | null
  email: string | null
}

interface UsersListProps {
  currentUserId: string
  initialUsers: UserListItem[]
}

export function UsersList({ currentUserId, initialUsers }: UsersListProps) {
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const refresh = () => router.refresh()

  const handleDelete = async () => {
    if (!userToDelete) return
    setIsDeleting(true)
    const result = await deleteUser(userToDelete.id)
    setIsDeleting(false)

    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Usuario eliminado')
    setDeleteDialogOpen(false)
    setUserToDelete(null)
    refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-balance">Usuarios</h2>
          <p className="text-muted-foreground text-sm">Gestiona las cuentas con acceso al sistema</p>
        </div>
        <Button onClick={() => { setEditingUser(null); setDrawerOpen(true) }}>
          <Plus className="mr-2 size-4" />
          Nuevo Usuario
        </Button>
      </div>

      {initialUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UsersIcon className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No hay usuarios</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Crea el primer usuario para empezar a gestionar accesos
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialUsers.map((user) => {
                const isSelf = user.id === currentUserId
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email || '—'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => { setEditingUser(user); setDrawerOpen(true) }}
                        >
                          <Pencil className="size-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          disabled={isSelf}
                          title={isSelf ? 'No podés eliminar tu propio usuario' : undefined}
                          onClick={() => { setUserToDelete(user); setDeleteDialogOpen(true) }}
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <UserDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        user={editingUser}
        onSuccess={refresh}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Usuario</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al usuario{' '}
              <strong>{userToDelete?.name || userToDelete?.email}</strong> y todas sus sesiones
              asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
