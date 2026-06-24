'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[App Error]', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-8 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-red-50 mb-5">
        <AlertTriangle className="size-7 text-red-500" />
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Algo salió mal</h1>
      <p className="max-w-md text-sm text-gray-500 mb-6">
        Ocurrió un error inesperado. Podés reintentar o volver al inicio.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="h-10 rounded-lg bg-teal-600 px-5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          Reintentar
        </button>
        <Link
          href="/dashboard"
          className="flex h-10 items-center rounded-lg border border-gray-200 px-5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  )
}
