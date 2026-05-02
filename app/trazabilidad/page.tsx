import { AppHeader } from '@/components/app-header'
import { TraceabilityMatrix } from '@/components/traceability/traceability-matrix'

export default function TraceabilityPage() {
  return (
    <>
      <AppHeader
        breadcrumbs={[{ label: 'Matriz de Trazabilidad' }]}
      />
      <main className="flex-1 overflow-auto p-6">
        <TraceabilityMatrix />
      </main>
    </>
  )
}
