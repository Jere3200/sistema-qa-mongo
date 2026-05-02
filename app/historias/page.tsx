import { AppHeader } from '@/components/app-header'
import { UserStoriesList } from '@/components/user-stories/user-stories-list'

export default function UserStoriesPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: 'Historias de Usuario' }]}
      />
      <main className="flex-1 overflow-auto p-6">
        <UserStoriesList />
      </main>
    </>
  )
}
