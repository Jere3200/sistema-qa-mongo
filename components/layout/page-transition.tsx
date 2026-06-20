'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

/**
 * Anima la entrada del contenido en cada cambio de ruta del shell autenticado.
 * El `key={pathname}` fuerza el re-montaje para que la transición se dispare al navegar.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="flex flex-1 flex-col min-h-0"
    >
      {children}
    </motion.div>
  )
}
