import { AppHeader } from '@/components/app-header'
import { TestCaseForm } from '@/components/test-cases/test-case-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditTestCasePage({ params }: Props) {
  const { id } = await params
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Casos de Prueba', href: '/casos-prueba' },
          { label: 'Editar' },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <TestCaseForm testCaseId={id} />
      </main>
    </>
  )
}
