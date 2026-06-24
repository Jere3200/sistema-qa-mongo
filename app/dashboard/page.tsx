import { redirect } from 'next/navigation'
import { getAuthenticatedUser, isAdmin } from '@/lib/auth/guards'
import { prisma } from '@/lib/prisma'
import { AppHeader } from '@/components/app-header'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { LogoutButton } from '@/components/auth/logout-button'

export default async function DashboardPage() {
  const me = await getAuthenticatedUser()
  if (!me) redirect('/login')

  const admin = isAdmin(me)
  const users = admin
    ? await prisma.user.findMany({
        select: { id: true, name: true, email: true },
        orderBy: { name: 'asc' },
      })
    : []

  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: 'Dashboard' }]}
        actions={<LogoutButton />}
      />
      <main className="flex-1 overflow-auto p-6">
        <DashboardContent currentUserId={me.id} initialUsers={users} isAdmin={admin} />
      </main>
    </>
  )
}
