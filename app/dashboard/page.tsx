import { AppHeader } from '@/components/app-header'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export default function DashboardPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: 'Dashboard' }]}
      />
      <main className="flex-1 overflow-auto p-6">
        <DashboardContent />
      </main>
    </>
  )
}
