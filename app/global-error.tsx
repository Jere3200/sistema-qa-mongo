'use client'

import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

// Captura errores del layout raíz. Debe renderizar su propio <html>/<body> y usa
// estilos inline porque los estilos globales podrían no estar disponibles acá.
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('[Global Error]', error)
  }, [error])

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          background: '#f9fafb',
          color: '#0f172a',
        }}
      >
        <div style={{ maxWidth: 420, padding: '0 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>Algo salió mal</h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 24px', lineHeight: 1.6 }}>
            Ocurrió un error inesperado en la aplicación. Probá recargar la página.
          </p>
          <button
            onClick={reset}
            style={{
              height: 40,
              padding: '0 20px',
              borderRadius: 10,
              border: 'none',
              background: '#0d9488',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  )
}
