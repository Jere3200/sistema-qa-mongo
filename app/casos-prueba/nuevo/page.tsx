import { Suspense } from 'react'
import { AppHeader } from '@/components/app-header'
import { TestCaseForm } from '@/components/test-cases/test-case-form'

export default function NewTestCasePage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[
          { label: 'Casos de Prueba', href: '/casos-prueba' },
          { label: 'Nuevo Caso de Prueba' },
        ]}
      />
      <main className="flex-1 overflow-auto p-6">
        <Suspense>
          <TestCaseForm />
        </Suspense>
      </main>
    </>
  )
}
