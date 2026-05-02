import { Suspense } from 'react'
import { AppHeader } from '@/components/app-header'
import { UserStoryForm } from '@/components/user-stories/user-story-form'

export default function NewUserStoryPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Historias de Usuario', href: '/historias' },
          { label: 'Nueva Historia' },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <Suspense>
          <UserStoryForm />
        </Suspense>
      </main>
    </>
  )
}
