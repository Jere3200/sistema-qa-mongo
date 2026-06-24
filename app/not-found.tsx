import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-8 py-20 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-gray-100 mb-5">
        <FileQuestion className="size-7 text-gray-400" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">404 — Página no encontrada</h1>
      <p className="max-w-md text-sm text-gray-500 mb-6">
        La página que buscás no existe o fue movida.
      </p>
      <Link
        href="/dashboard"
        className="flex h-10 items-center rounded-lg bg-teal-600 px-5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
