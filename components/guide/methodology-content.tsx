"use client"

import { useState } from "react"
import {
  Search,
  FileEdit,
  Code2,
  TestTube2,
  Rocket,
  Settings2,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Users,
  Clock,
  Target,
  AlertCircle,
  Lightbulb,
  RefreshCcw,
  Layers,
  GitBranch,
  MessageSquare,
  Calendar,
  TrendingUp,
  Shield,
  BookOpen,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface Phase {
  id: string
  number: number
  name: string
  icon: React.ReactNode
  color: string
  duration: string
  description: string
  objectives: string[]
  deliverables: string[]
  roles: string[]
  rqaTracerConnection: string
}

const sdlcPhases: Phase[] = [
  {
    id: "requirements",
    number: 1,
    name: "Análisis de Requisitos",
    icon: <Search className="h-6 w-6" />,
    color: "bg-blue-500",
    duration: "2-4 semanas",
    description: "En esta fase se recopilan, analizan y documentan las necesidades del negocio y los usuarios. Es fundamental entender QUÉ debe hacer el sistema antes de pensar en CÓMO lo hará.",
    objectives: [
      "Identificar a todos los stakeholders (interesados)",
      "Recopilar requisitos funcionales y no funcionales",
      "Definir el alcance del proyecto",
      "Establecer prioridades y restricciones",
      "Validar requisitos con el cliente"
    ],
    deliverables: [
      "Documento de Requisitos del Sistema (SRS)",
      "Historias de Usuario con criterios de aceptación",
      "Diagramas de casos de uso",
      "Matriz de trazabilidad inicial"
    ],
    roles: ["Analista Funcional", "Product Owner", "Stakeholders", "Usuario Final"],
    rqaTracerConnection: "Aquí es donde creas tus Proyectos, Módulos e Historias de Usuario en RQA-Tracer. Cada requisito se documenta como una historia con el formato Como/Quiero/Para."
  },
  {
    id: "design",
    number: 2,
    name: "Diseño del Sistema",
    icon: <FileEdit className="h-6 w-6" />,
    color: "bg-purple-500",
    duration: "2-3 semanas",
    description: "Se traduce el QUÉ en el CÓMO. Se diseña la arquitectura del sistema, la base de datos, las interfaces y los componentes que cumplirán con los requisitos.",
    objectives: [
      "Definir la arquitectura del sistema",
      "Diseñar la estructura de la base de datos",
      "Crear prototipos de interfaces de usuario",
      "Establecer estándares de desarrollo",
      "Planificar la integración de componentes"
    ],
    deliverables: [
      "Documento de Diseño de Alto Nivel (HLD)",
      "Documento de Diseño Detallado (LLD)",
      "Diagramas de arquitectura y flujo",
      "Modelo de datos / ERD",
      "Wireframes y mockups de UI"
    ],
    roles: ["Arquitecto de Software", "Diseñador UX/UI", "Analista Técnico", "DBA"],
    rqaTracerConnection: "Durante el diseño, revisa las Historias de Usuario para asegurar que el diseño técnico cubre todos los criterios de aceptación documentados."
  },
  {
    id: "development",
    number: 3,
    name: "Desarrollo / Implementación",
    icon: <Code2 className="h-6 w-6" />,
    color: "bg-green-500",
    duration: "Variable (sprints de 2-4 semanas)",
    description: "Los desarrolladores escriben el código que implementa el diseño. Se construyen los componentes, se integran y se realizan pruebas unitarias.",
    objectives: [
      "Codificar según las especificaciones de diseño",
      "Seguir estándares de código y buenas prácticas",
      "Realizar pruebas unitarias",
      "Documentar el código",
      "Integrar componentes progresivamente"
    ],
    deliverables: [
      "Código fuente versionado",
      "Pruebas unitarias automatizadas",
      "Documentación técnica del código",
      "Builds ejecutables",
      "Reportes de cobertura de código"
    ],
    roles: ["Desarrollador Frontend", "Desarrollador Backend", "DevOps", "Tech Lead"],
    rqaTracerConnection: "Las Historias de Usuario pasan de 'Backlog' a 'In Progress'. El equipo de desarrollo trabaja basándose en los criterios de aceptación definidos."
  },
  {
    id: "testing",
    number: 4,
    name: "Pruebas / QA",
    icon: <TestTube2 className="h-6 w-6" />,
    color: "bg-amber-500",
    duration: "1-2 semanas por ciclo",
    description: "Se verifican y validan las funcionalidades desarrolladas. Se ejecutan diferentes tipos de pruebas para asegurar que el sistema cumple con los requisitos.",
    objectives: [
      "Verificar que el código cumple los requisitos",
      "Identificar y reportar defectos",
      "Validar la experiencia de usuario",
      "Probar escenarios edge y de error",
      "Asegurar la calidad antes del release"
    ],
    deliverables: [
      "Plan de pruebas",
      "Casos de prueba documentados",
      "Reportes de ejecución de pruebas",
      "Reportes de defectos/bugs",
      "Certificación de calidad"
    ],
    roles: ["QA Tester", "Analista de Pruebas", "Automatizador QA", "Usuario Final (UAT)"],
    rqaTracerConnection: "Aquí es donde creas y ejecutas los Casos de Prueba en RQA-Tracer. Vincula cada caso a su Historia de Usuario y actualiza el estado (Passed/Failed). La Matriz de Trazabilidad te muestra la cobertura."
  },
  {
    id: "deployment",
    number: 5,
    name: "Despliegue / Liberación",
    icon: <Rocket className="h-6 w-6" />,
    color: "bg-rose-500",
    duration: "1-3 días",
    description: "El sistema probado se despliega en el ambiente de producción. Se prepara la infraestructura, se migran datos si es necesario y se libera a los usuarios finales.",
    objectives: [
      "Preparar el ambiente de producción",
      "Ejecutar scripts de migración de datos",
      "Desplegar la aplicación sin tiempo de inactividad",
      "Verificar funcionamiento post-despliegue",
      "Capacitar a usuarios finales"
    ],
    deliverables: [
      "Plan de despliegue",
      "Scripts de migración",
      "Documentación de rollback",
      "Manual de usuario",
      "Release notes"
    ],
    roles: ["DevOps / SRE", "Administrador de Sistemas", "DBA", "Soporte Técnico"],
    rqaTracerConnection: "Solo las Historias de Usuario con todos sus Casos de Prueba en 'Passed' deberían incluirse en el release. La regla de negocio de RQA-Tracer garantiza esto."
  },
  {
    id: "maintenance",
    number: 6,
    name: "Mantenimiento y Soporte",
    icon: <Settings2 className="h-6 w-6" />,
    color: "bg-slate-500",
    duration: "Continuo",
    description: "Post-lanzamiento, el sistema requiere mantenimiento correctivo (bugs), adaptativo (cambios de entorno), perfectivo (mejoras) y preventivo (optimizaciones).",
    objectives: [
      "Monitorear el rendimiento del sistema",
      "Corregir defectos encontrados en producción",
      "Implementar mejoras solicitadas por usuarios",
      "Mantener actualizado el sistema",
      "Documentar cambios y lecciones aprendidas"
    ],
    deliverables: [
      "Tickets de soporte resueltos",
      "Parches y actualizaciones",
      "Reportes de incidentes",
      "Métricas de rendimiento",
      "Backlog de mejoras futuras"
    ],
    roles: ["Soporte Técnico", "Desarrollador", "QA", "Product Owner"],
    rqaTracerConnection: "Nuevos requisitos o correcciones se documentan como nuevas Historias de Usuario, manteniendo la trazabilidad histórica del sistema."
  }
]

interface Methodology {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  characteristics: string[]
  advantages: string[]
  disadvantages: string[]
  bestFor: string[]
}

const methodologies: Methodology[] = [
  {
    id: "waterfall",
    name: "Cascada (Waterfall)",
    icon: <ArrowDown className="h-5 w-5" />,
    description: "Modelo secuencial donde cada fase debe completarse antes de iniciar la siguiente. Es lineal y predecible.",
    characteristics: [
      "Fases secuenciales y no superpuestas",
      "Documentación extensiva en cada fase",
      "Requisitos definidos al inicio y no cambian",
      "Entrega única al final del proyecto"
    ],
    advantages: [
      "Fácil de entender y gestionar",
      "Documentación completa",
      "Progreso fácil de medir",
      "Bueno para equipos con poca experiencia"
    ],
    disadvantages: [
      "Poco flexible ante cambios",
      "El cliente ve el producto hasta el final",
      "Errores se detectan tarde",
      "No apto para proyectos complejos o inciertos"
    ],
    bestFor: [
      "Proyectos pequeños con requisitos claros",
      "Sistemas regulados con documentación obligatoria",
      "Proyectos con presupuesto y tiempo fijos"
    ]
  },
  {
    id: "agile",
    name: "Ágil (Agile)",
    icon: <RefreshCcw className="h-5 w-5" />,
    description: "Enfoque iterativo e incremental que abraza el cambio. El trabajo se divide en iteraciones cortas llamadas sprints.",
    characteristics: [
      "Iteraciones cortas (1-4 semanas)",
      "Entrega incremental de valor",
      "Colaboración continua con el cliente",
      "Adaptación constante a cambios"
    ],
    advantages: [
      "Alta adaptabilidad al cambio",
      "Feedback temprano y continuo",
      "Entregas frecuentes de valor",
      "Mayor satisfacción del cliente"
    ],
    disadvantages: [
      "Requiere compromiso del cliente",
      "Difícil estimar tiempo y costo total",
      "Puede perder visión del objetivo final",
      "Requiere equipo experimentado y auto-organizado"
    ],
    bestFor: [
      "Proyectos con requisitos cambiantes",
      "Startups y productos nuevos",
      "Equipos pequeños y colaborativos",
      "Proyectos que necesitan time-to-market rápido"
    ]
  },
  {
    id: "scrum",
    name: "Scrum",
    icon: <Layers className="h-5 w-5" />,
    description: "Framework ágil con roles definidos, ceremonias y artefactos. Organiza el trabajo en sprints de duración fija.",
    characteristics: [
      "Sprints de 2-4 semanas",
      "Roles: Product Owner, Scrum Master, Dev Team",
      "Ceremonias: Daily, Planning, Review, Retro",
      "Artefactos: Product Backlog, Sprint Backlog, Incremento"
    ],
    advantages: [
      "Estructura clara dentro de la agilidad",
      "Transparencia y visibilidad del progreso",
      "Mejora continua integrada",
      "Equipos auto-organizados y empoderados"
    ],
    disadvantages: [
      "Requiere compromiso total del equipo",
      "Scrum Master y PO deben ser capacitados",
      "No funciona bien con equipos distribuidos sin herramientas",
      "Puede ser rígido en las ceremonias"
    ],
    bestFor: [
      "Equipos de desarrollo de software",
      "Proyectos con entregables incrementales",
      "Organizaciones que buscan transformación ágil"
    ]
  },
  {
    id: "kanban",
    name: "Kanban",
    icon: <GitBranch className="h-5 w-5" />,
    description: "Sistema visual de gestión del flujo de trabajo. Se enfoca en limitar el trabajo en progreso y optimizar el flujo.",
    characteristics: [
      "Tablero visual con columnas de estado",
      "Límites de trabajo en progreso (WIP)",
      "Flujo continuo sin iteraciones fijas",
      "Métricas de lead time y cycle time"
    ],
    advantages: [
      "Muy flexible y fácil de implementar",
      "Visualización clara del trabajo",
      "Identifica cuellos de botella",
      "No requiere cambios organizacionales grandes"
    ],
    disadvantages: [
      "Puede faltar estructura para algunos equipos",
      "Sin timeboxing, puede faltar urgencia",
      "Requiere disciplina para respetar WIP limits",
      "Menos prescriptivo que Scrum"
    ],
    bestFor: [
      "Equipos de soporte y operaciones",
      "Proyectos con trabajo continuo (no proyectos)",
      "Equipos que ya tienen otro proceso y quieren mejorarlo"
    ]
  }
]

function PhaseCard({ phase, isSelected, onClick }: { phase: Phase; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:shadow-md",
        isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/50"
      )}
    >
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-full text-white", phase.color)}>
        {phase.icon}
      </div>
      <div className="text-center">
        <div className="text-xs text-muted-foreground">Fase {phase.number}</div>
        <div className="text-sm font-medium">{phase.name}</div>
      </div>
    </button>
  )
}

export function MethodologyContent() {
  const [selectedPhase, setSelectedPhase] = useState<Phase>(sdlcPhases[0])

  return (
    <div className="space-y-8">
      {/* Introducción */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            ¿Qué es el Ciclo de Desarrollo de Software (SDLC)?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            El <strong>Software Development Life Cycle (SDLC)</strong> es un proceso estructurado que define las fases necesarias para planificar, crear, probar y desplegar un sistema de información. Proporciona un marco de trabajo que guía a los equipos desde la concepción de una idea hasta su implementación y mantenimiento.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
              <Target className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <div className="text-sm font-medium">Propósito</div>
                <div className="text-xs text-muted-foreground">Producir software de alta calidad que cumpla las expectativas del cliente</div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <div className="text-sm font-medium">Eficiencia</div>
                <div className="text-xs text-muted-foreground">Completar el desarrollo dentro del tiempo y presupuesto estimados</div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <div className="text-sm font-medium">Calidad</div>
                <div className="text-xs text-muted-foreground">Asegurar que el software sea confiable, seguro y mantenible</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fases del SDLC */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Las 6 Fases del Desarrollo</h2>
          <p className="text-sm text-muted-foreground">Haz clic en cada fase para ver los detalles</p>
        </div>

        {/* Selector visual de fases */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {sdlcPhases.map((phase, index) => (
            <div key={phase.id} className="flex items-center gap-2">
              <PhaseCard 
                phase={phase} 
                isSelected={selectedPhase.id === phase.id}
                onClick={() => setSelectedPhase(phase)}
              />
              {index < sdlcPhases.length - 1 && (
                <ArrowRight className="hidden h-5 w-5 text-muted-foreground sm:block" />
              )}
            </div>
          ))}
        </div>

        {/* Detalle de la fase seleccionada */}
        <Card className={cn("border-2 transition-colors", `border-${selectedPhase.color.replace('bg-', '')}/30`)}>
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white", selectedPhase.color)}>
                {selectedPhase.icon}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">Fase {selectedPhase.number}</Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {selectedPhase.duration}
                  </Badge>
                </div>
                <CardTitle className="mt-1">{selectedPhase.name}</CardTitle>
                <CardDescription className="mt-1">{selectedPhase.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Objetivos */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-medium">
                  <Target className="h-4 w-4 text-primary" />
                  Objetivos
                </h4>
                <ul className="space-y-2">
                  {selectedPhase.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Entregables */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-medium">
                  <FileEdit className="h-4 w-4 text-primary" />
                  Entregables
                </h4>
                <ul className="space-y-2">
                  {selectedPhase.deliverables.map((del, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {del}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Roles */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-medium">
                  <Users className="h-4 w-4 text-primary" />
                  Roles Involucrados
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPhase.roles.map((role, i) => (
                    <Badge key={i} variant="secondary">{role}</Badge>
                  ))}
                </div>
              </div>

              {/* Conexión con RQA-Tracer */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-medium text-primary">
                  <Lightbulb className="h-4 w-4" />
                  En RQA-Tracer
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedPhase.rqaTracerConnection}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metodologías */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Metodologías de Desarrollo</h2>
          <p className="text-sm text-muted-foreground">Diferentes enfoques para organizar el trabajo del equipo</p>
        </div>

        <Tabs defaultValue="waterfall" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            {methodologies.map((method) => (
              <TabsTrigger key={method.id} value={method.id} className="flex items-center gap-2">
                {method.icon}
                <span className="hidden sm:inline">{method.name}</span>
                <span className="sm:hidden">{method.name.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {methodologies.map((method) => (
            <TabsContent key={method.id} value={method.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {method.icon}
                    {method.name}
                  </CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Características</h4>
                        <ul className="space-y-1">
                          {method.characteristics.map((char, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-primary">•</span>
                              {char}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h4 className="flex items-center gap-1 text-sm font-medium text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          Ventajas
                        </h4>
                        <ul className="space-y-1">
                          {method.advantages.map((adv, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-green-600">+</span>
                              {adv}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="flex items-center gap-1 text-sm font-medium text-amber-600">
                          <AlertCircle className="h-4 w-4" />
                          Desventajas
                        </h4>
                        <ul className="space-y-1">
                          {method.disadvantages.map((dis, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-amber-600">-</span>
                              {dis}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h4 className="flex items-center gap-1 text-sm font-medium text-primary">
                          <TrendingUp className="h-4 w-4" />
                          Ideal Para
                        </h4>
                        <ul className="space-y-1">
                          {method.bestFor.map((best, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-primary">→</span>
                              {best}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Consejos generales */}
      <Card className="border-green-500/20 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <Lightbulb className="h-5 w-5" />
            Consejos para el Éxito
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3">
              <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <div className="text-sm font-medium">Comunicación Constante</div>
                <div className="text-xs text-muted-foreground">Mantén al equipo y stakeholders informados en todo momento</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileEdit className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <div className="text-sm font-medium">Documentación Clara</div>
                <div className="text-xs text-muted-foreground">Documenta decisiones, requisitos y cambios importantes</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TestTube2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <div className="text-sm font-medium">Pruebas Tempranas</div>
                <div className="text-xs text-muted-foreground">Detectar errores temprano es más barato que corregirlos después</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <div className="text-sm font-medium">Involucra al Usuario</div>
                <div className="text-xs text-muted-foreground">El feedback del usuario final es invaluable</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <div className="text-sm font-medium">Planifica con Margen</div>
                <div className="text-xs text-muted-foreground">Siempre ocurren imprevistos, planifica buffer de tiempo</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RefreshCcw className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <div>
                <div className="text-sm font-medium">Mejora Continua</div>
                <div className="text-xs text-muted-foreground">Aprende de cada proyecto y aplica las lecciones</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
