"use client"

import { LearnContent } from "@/components/guide/learn-content"

export default function AprenderPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Desarrollo de Sistemas</h1>
        <p className="text-muted-foreground">
          Las 6 fases del SDLC, metodologías de trabajo, técnicas clave y los errores más costosos que podés evitar
        </p>
      </div>
      <LearnContent />
    </div>
  )
}
