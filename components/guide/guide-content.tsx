"use client"

import { useState } from "react"
import Link from "next/link"
import {
  FolderKanban,
  Layers,
  FileText,
  CheckSquare,
  FlaskConical,
  GitBranch,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface GuideStep {
  number: number
  title: string
  description: string
  icon: React.ReactNode
  why: string
  howTo: string[]
  tips: string[]
  warnings?: string[]
  link: string
  linkText: string
}

const guideSteps: GuideStep[] = [
  {
    number: 1,
    title: "Crear un Proyecto",
    description: "Todo comienza con un proyecto que agrupa el trabajo de desarrollo.",
    icon: <FolderKanban className="h-6 w-6" />,
    why: "El proyecto es el contenedor principal que organiza todo el trabajo. Sin un proyecto, no puedes crear módulos, historias de usuario ni casos de prueba. Piensa en él como la carpeta raíz de tu documentación.",
    howTo: [
      "Ve a la sección 'Proyectos' en el menú lateral",
      "Haz clic en 'Nuevo Proyecto'",
      "Completa el nombre, descripción y selecciona la prioridad",
      "Guarda el proyecto"
    ],
    tips: [
      "Usa nombres descriptivos que identifiquen claramente el sistema o aplicación",
      "La descripción debe explicar el objetivo general del proyecto",
      "Puedes tener múltiples proyectos activos simultáneamente"
    ],
    link: "/proyectos",
    linkText: "Ir a Proyectos"
  },
  {
    number: 2,
    title: "Definir Módulos",
    description: "Divide el proyecto en módulos funcionales para organizar mejor el trabajo.",
    icon: <Layers className="h-6 w-6" />,
    why: "Los módulos representan las grandes áreas funcionales de tu sistema. Por ejemplo: 'Autenticación', 'Gestión de Usuarios', 'Reportes'. Esta división facilita la organización y permite que diferentes equipos trabajen en paralelo.",
    howTo: [
      "Abre el detalle de un proyecto existente",
      "En la sección de módulos, haz clic en 'Agregar Módulo'",
      "Define el nombre y descripción del módulo",
      "El módulo quedará vinculado automáticamente al proyecto"
    ],
    tips: [
      "Identifica los módulos según las funcionalidades principales del negocio",
      "Un módulo debe ser lo suficientemente grande para contener varias historias de usuario",
      "Evita módulos demasiado pequeños o demasiado grandes"
    ],
    warnings: [
      "No crees módulos antes de tener claro el alcance del proyecto"
    ],
    link: "/proyectos",
    linkText: "Ver Proyectos"
  },
  {
    number: 3,
    title: "Escribir Historias de Usuario",
    description: "Documenta los requisitos desde la perspectiva del usuario final.",
    icon: <FileText className="h-6 w-6" />,
    why: "Las historias de usuario son la forma más efectiva de capturar requisitos porque se centran en el valor para el usuario. El formato 'Como [rol], quiero [acción], para [beneficio]' asegura que siempre documentamos el propósito detrás de cada funcionalidad.",
    howTo: [
      "Ve a 'Historias de Usuario' y haz clic en 'Nueva Historia'",
      "Selecciona el proyecto y módulo correspondiente",
      "Completa el formato: Como [rol], Quiero [acción], Para [beneficio]",
      "Añade los criterios de aceptación que definen cuándo está completa"
    ],
    tips: [
      "Los criterios de aceptación deben ser verificables y específicos",
      "Una buena historia de usuario es pequeña y entregable en un sprint",
      "Incluye criterios de aceptación para casos edge y errores"
    ],
    warnings: [
      "Una historia sin criterios de aceptación no puede considerarse completa",
      "Evita historias demasiado técnicas - enfócate en el valor de negocio"
    ],
    link: "/historias",
    linkText: "Ir a Historias"
  },
  {
    number: 4,
    title: "Crear Casos de Prueba",
    description: "Define cómo verificar que cada historia de usuario funciona correctamente.",
    icon: <FlaskConical className="h-6 w-6" />,
    why: "Los casos de prueba son la garantía de calidad. Sin ellos, no hay forma objetiva de verificar que el desarrollo cumple con los requisitos. Además, la regla de negocio exige que una historia no puede marcarse como 'Done' sin al menos un caso de prueba aprobado.",
    howTo: [
      "Ve a 'Casos de Prueba' y haz clic en 'Nuevo Caso'",
      "Vincula el caso de prueba a una historia de usuario existente",
      "Usa el formato Gherkin: Dado [contexto], Cuando [acción], Entonces [resultado]",
      "Define los pasos detallados y el resultado esperado"
    ],
    tips: [
      "Cada criterio de aceptación debería tener al menos un caso de prueba",
      "Incluye casos de prueba para escenarios positivos y negativos",
      "Los pasos deben ser reproducibles por cualquier persona del equipo"
    ],
    warnings: [
      "No marques una historia como 'Done' sin casos de prueba aprobados",
      "Un caso de prueba fallido bloquea el cierre de la historia"
    ],
    link: "/casos-prueba",
    linkText: "Ir a Casos de Prueba"
  },
  {
    number: 5,
    title: "Ejecutar y Actualizar Estados",
    description: "Sigue el flujo de estados para mantener la trazabilidad actualizada.",
    icon: <CheckSquare className="h-6 w-6" />,
    why: "El flujo de estados (Backlog → In Progress → Testing → Done) refleja el ciclo de vida real del desarrollo. Mantener los estados actualizados permite al equipo saber exactamente qué está pasando y detectar cuellos de botella.",
    howTo: [
      "Las historias nuevas comienzan en 'Backlog'",
      "Cuando el desarrollo inicia, muévela a 'In Progress'",
      "Al terminar el desarrollo, pasa a 'Testing'",
      "Solo cuando los casos de prueba pasen, marca como 'Done'"
    ],
    tips: [
      "Actualiza los estados en tiempo real para mantener visibilidad",
      "El Dashboard muestra métricas basadas en estos estados",
      "Los casos de prueba tienen su propio flujo: Pending → Passed/Failed/Blocked"
    ],
    warnings: [
      "Una historia no puede pasar a 'Done' si tiene casos de prueba en 'Failed' o 'Blocked'"
    ],
    link: "/historias",
    linkText: "Ver Estados"
  },
  {
    number: 6,
    title: "Revisar la Matriz de Trazabilidad",
    description: "Verifica que cada requisito tiene cobertura de pruebas adecuada.",
    icon: <GitBranch className="h-6 w-6" />,
    why: "La matriz de trazabilidad es tu herramienta de auditoría. Muestra la relación entre historias de usuario y casos de prueba, permitiendo identificar requisitos sin cobertura y asegurar que nada se quede sin probar.",
    howTo: [
      "Ve a la sección 'Trazabilidad' en el menú",
      "Selecciona el proyecto que deseas analizar",
      "Revisa la matriz que cruza historias con casos de prueba",
      "Identifica historias sin casos de prueba (celdas vacías)"
    ],
    tips: [
      "Una buena cobertura tiene al menos 2-3 casos de prueba por historia",
      "Presta atención a las historias de alta prioridad sin cobertura",
      "Usa la matriz antes de cada release para validar completitud"
    ],
    link: "/trazabilidad",
    linkText: "Ver Matriz"
  }
]

function StepCard({ step, isExpanded, onToggle }: { step: GuideStep; isExpanded: boolean; onToggle: () => void }) {
  return (
    <Card className={cn(
      "transition-all duration-200",
      isExpanded && "ring-2 ring-primary/20"
    )}>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {step.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Paso {step.number}
                  </Badge>
                </div>
                <CardTitle className="mt-1">{step.title}</CardTitle>
                <CardDescription className="mt-1">{step.description}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="ml-16 space-y-6">
              {/* Por qué */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Lightbulb className="h-4 w-4" />
                  ¿Por qué es importante?
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.why}
                </p>
              </div>

              {/* Cómo hacerlo */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BookOpen className="h-4 w-4" />
                  Cómo hacerlo
                </div>
                <ol className="space-y-1.5">
                  {step.howTo.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tips */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Consejos
                </div>
                <ul className="space-y-1">
                  {step.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-green-600 dark:text-green-400">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Warnings */}
              {step.warnings && step.warnings.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    Precauciones
                  </div>
                  <ul className="space-y-1">
                    {step.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-amber-600 dark:text-amber-400">•</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Link */}
              <div className="pt-2">
                <Button asChild>
                  <Link href={step.link}>
                    {step.linkText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export function GuideContent() {
  const [expandedStep, setExpandedStep] = useState<number | null>(1)

  return (
    <div className="space-y-6">
      {/* Introducción */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Bienvenido a RQA-Tracer
          </CardTitle>
          <CardDescription>
            Esta guía te ayudará a entender el flujo de trabajo para documentar requisitos y asegurar la calidad de tus proyectos de software.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">Requisitos Claros</div>
                <div className="text-xs text-muted-foreground">Formato estructurado</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <FlaskConical className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">Pruebas Vinculadas</div>
                <div className="text-xs text-muted-foreground">Cobertura garantizada</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <GitBranch className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">Trazabilidad Total</div>
                <div className="text-xs text-muted-foreground">Auditoría completa</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flujo visual */}
      <Card>
        <CardHeader>
          <CardTitle>Flujo de Trabajo</CardTitle>
          <CardDescription>
            Sigue estos pasos en orden para documentar correctamente un proyecto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {guideSteps.map((step, index) => (
              <div key={step.number} className="flex items-center gap-2">
                <button
                  onClick={() => setExpandedStep(step.number)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    expandedStep === step.number
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-background/20 text-xs">
                    {step.number}
                  </span>
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
                {index < guideSteps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pasos detallados */}
      <div className="space-y-4">
        {guideSteps.map((step) => (
          <StepCard
            key={step.number}
            step={step}
            isExpanded={expandedStep === step.number}
            onToggle={() => setExpandedStep(expandedStep === step.number ? null : step.number)}
          />
        ))}
      </div>

      {/* Regla de negocio importante */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            Regla de Negocio Clave
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">
            <strong>Una Historia de Usuario no puede marcarse como &quot;Done&quot; (Completada) hasta que tenga al menos un Caso de Prueba con estado &quot;Passed&quot; (Aprobado).</strong>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta regla garantiza que cada funcionalidad entregada ha sido verificada y cumple con los criterios de aceptación definidos. Es la base de la trazabilidad entre requisitos y pruebas.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
