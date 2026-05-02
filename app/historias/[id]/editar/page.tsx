import { AppHeader } from '@/components/app-header'
import { UserStoryForm } from '@/components/user-stories/user-story-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditUserStoryPage({ params }: Props) {
  const { id } = await params
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Historias de Usuario', href: '/historias' },
          { label: 'Editar' },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <UserStoryForm storyId={id} />
      </main>
    </>
  )
}
