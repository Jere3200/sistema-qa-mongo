import { AppHeader } from '@/components/app-header'
import { ProjectsList } from '@/components/projects/projects-list'

export default function ProjectsPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: 'Proyectos' }]}
      />
      <main className="flex-1 overflow-auto p-6">
        <ProjectsList />
      </main>
    </>
  )
}
