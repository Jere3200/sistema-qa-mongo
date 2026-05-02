"use client"

import { GuideContent } from "@/components/guide/guide-content"

export default function GuiaPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Guía del Analista</h1>
        <p className="text-muted-foreground">
          Aprende el flujo de trabajo para documentar requisitos y casos de prueba
        </p>
      </div>
      <GuideContent />
    </div>
  )
}
