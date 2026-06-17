import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { SwaggerPanel } from './swagger-panel'

export default async function DocsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?redirigir=/docs')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Documentación de la API</h1>
          <p className="mt-1 text-sm text-gray-500">
            Endpoints REST del sistema RQA-Tracer. Todos requieren sesión activa.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <SwaggerPanel />
        </div>
      </div>
    </div>
  )
}
