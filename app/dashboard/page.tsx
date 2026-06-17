import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AppHeader } from '@/components/app-header'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { LogoutButton } from '@/components/auth/logout-button'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const currentUserId = (session.user as { id: string }).id
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  })

  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: 'Dashboard' }]}
        actions={<LogoutButton />}
      />
      <main className="flex-1 overflow-auto p-6">
        <DashboardContent currentUserId={currentUserId} initialUsers={users} />
      </main>
    </>
  )
}
