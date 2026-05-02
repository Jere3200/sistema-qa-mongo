import { AppHeader } from '@/components/app-header'
import { TestCaseDetail } from '@/components/test-cases/test-case-detail'

interface Props {
  params: Promise<{ id: string }>
}

export default async function TestCaseDetailPage({ params }: Props) {
  const { id } = await params
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Casos de Prueba', href: '/casos-prueba' },
          { label: 'Detalle' },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <TestCaseDetail testCaseId={id} />
      </main>
    </>
  )
}
