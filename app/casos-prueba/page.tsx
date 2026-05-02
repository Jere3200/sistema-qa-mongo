import { AppHeader } from '@/components/app-header'
import { TestCasesList } from '@/components/test-cases/test-cases-list'

export default function TestCasesPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: 'Casos de Prueba' }]}
      />
      <main className="flex-1 overflow-auto p-6">
        <TestCasesList />
      </main>
    </>
  )
}
