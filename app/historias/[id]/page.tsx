import { AppHeader } from '@/components/app-header'
import { UserStoryDetail } from '@/components/user-stories/user-story-detail'

interface Props {
  params: Promise<{ id: string }>
}

export default async function UserStoryDetailPage({ params }: Props) {
  const { id } = await params
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Historias de Usuario', href: '/historias' },
          { label: 'Detalle' },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <UserStoryDetail storyId={id} />
      </main>
    </>
  )
}
