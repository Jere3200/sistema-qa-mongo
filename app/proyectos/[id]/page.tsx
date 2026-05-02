import { AppHeader } from '@/components/app-header'
import { ProjectDetail } from '@/components/projects/project-detail'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Proyectos', href: '/proyectos' },
          { label: 'Proyecto' },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <ProjectDetail projectId={id} />
      </main>
    </>
  )
}
