# CLAUDE.md — Adaptive Master Stack 2026

Sos mi desarrollador senior. Cada línea de código que generes debe ser profesional, modular y lista para producción. No generes código de ejemplo ni placeholder: todo debe funcionar.

---

## Stack Tecnológico

### Core
- Next.js (latest) con App Router y TypeScript estricto
- Tailwind CSS (latest) con diseño utility-first
- next-themes para Dark/Light mode

### UI & Componentes
- shadcn/ui como base de componentes (control total del código, siempre copiar, nunca importar como dependencia opaca)
- aceternity-ui para efectos visuales premium
- magic-ui para micro-interacciones y componentes animados
- framer-motion para animaciones complejas y transiciones de layout

### Utilidades
- lucide-react para iconografía
- sonner para notificaciones/toasts
- vaul para drawers mobile-first
- clsx + tailwind-merge para manejo condicional de clases

### Instalación
Cuando inicies un proyecto o detectes que falta una dependencia, instalala con `npm install` sin preguntar. Si un componente requiere un paquete que no está en package.json, agregalo.

---

## Principios SOLID

Aplicá estos principios en cada archivo que generes:

- **S — Single Responsibility:** Cada función, hook y componente hace UNA sola cosa. Si un componente supera ~80 líneas, dividilo.
- **O — Open/Closed:** Diseñá componentes extensibles via props y composición, no modificando código existente. Usá variantes (cva/class-variance-authority) en vez de condicionales internos.
- **L — Liskov Substitution:** Los componentes hijos deben poder reemplazar a los padres sin romper la interfaz. Respetá los contratos de tipos.
- **I — Interface Segregation:** No fuerces props innecesarias. Tipá con interfaces pequeñas y específicas, no con objetos gigantes.
- **D — Dependency Inversion:** Los componentes de UI no deben conocer la lógica de negocio. Inyectá datos y callbacks via props o context.

---

## Clean Code — Reglas Obligatorias

### Naming
- **camelCase** para variables, funciones, hooks, handlers y props
- **PascalCase** para componentes, tipos, interfaces y enums
- **UPPER_SNAKE_CASE** para constantes y variables de entorno
- Nombres descriptivos y autodocumentados: `getUserById`, no `getUser` ni `getData`
- Hooks custom siempre empiezan con `use`: `useMediaQuery`, `useScrollPosition`
- Handlers siempre empiezan con `handle` o `on`: `handleSubmit`, `onClickCard`
- Booleanos empiezan con `is`, `has`, `should`, `can`: `isLoading`, `hasError`

### Estructura de Archivos
```
src/
├── app/                  # Rutas (App Router)
├── components/
│   ├── ui/               # Componentes base (shadcn, botones, inputs)
│   └── sections/         # Bloques de página (hero, features, pricing)
├── hooks/                # Custom hooks
├── lib/                  # Utilidades puras (cn, formatters, validators)
├── types/                # Tipos e interfaces compartidas
├── constants/            # Constantes globales
└── styles/               # CSS global y tokens
```

### Reglas de Código
- Funciones puras siempre que sea posible: sin side effects, misma entrada = misma salida
- Máximo 3 parámetros por función; si necesitás más, usá un objeto tipado
- No usar `any` jamás. Si no sabés el tipo, usá `unknown` y narrowing
- No usar `else` innecesario: preferí early returns y guard clauses
- No código muerto, no comentarios obvios, no console.log en código final
- Extraé magic numbers a constantes con nombre descriptivo
- Un archivo = una responsabilidad. No mezcles un hook con un componente
- DRY: si repetís lógica 2 veces, extraela. Si repetís UI 2 veces, componentizala
- Composición sobre herencia: siempre

### TypeScript
- `strict: true` obligatorio en tsconfig
- Interfaces para objetos/props, types para uniones y utilidades
- Nunca castear con `as` salvo casos justificados
- Genéricos cuando aporten reutilización real, no por complejidad innecesaria
- Exportá los tipos junto al componente que los usa

---

## Diseño Profesional — Reglas Visuales

### Filosofía
Cada interfaz debe verse como un producto real de una startup bien financiada. Nada genérico, nada placeholder. Si necesitás inspiración, pensá en Vercel, Linear, Raycast, Arc Browser.

### Diseño visual (por defecto: modo claro)
- Fondo principal: `bg-white` o `bg-gray-50`
- Fondo de sección alternada: `bg-gray-50`
- Bordes: `border-gray-200` para separación sutil
- Texto primario: `text-gray-900`, secundario: `text-gray-500`
- Sombras suaves: `shadow-sm` o `shadow-md`, nunca agresivas
- Acentos: un solo color de acento por proyecto (teal por defecto), usado con moderación
- Cards: `bg-white border border-gray-200 shadow-sm rounded-xl`
- Estado activo / seleccionado: fondo con opacidad del acento, ej. `bg-teal-50 text-teal-700`

### Tipografía
- Jerarquía clara: máximo 3 tamaños de heading por sección
- Font weight con propósito: bold para títulos, medium para labels, regular para cuerpo
- Line-height generoso para legibilidad: `leading-relaxed` en párrafos
- Tracking sutil en headings grandes: `tracking-tight`

### Espaciado y Layout
- Sistema de espaciado consistente basado en múltiplos de 4: `p-4`, `gap-6`, `mt-8`
- Contenedores con `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Diseño mobile-first: empezá siempre desde mobile y escalá con breakpoints

### Animaciones
- Toda transición tiene propósito: guiar atención, dar feedback, crear fluidez
- Duración base: 200-300ms para UI, 500-800ms para elementos hero
- Easing: siempre `ease-out` o custom cubic-bezier, nunca `linear` para UI
- Framer Motion para animaciones de entrada, layout y gestures
- aceternity-ui y magic-ui para efectos hero premium (grids, meteors, spotlight)
- No animes por animar: cada animación debe comunicar algo

### Componentes
- Botones con estados visibles: hover, active, focus-visible, disabled
- Inputs con labels siempre visibles (no solo placeholder)
- Loading states explícitos: skeletons > spinners
- Empty states con ilustración o mensaje útil, nunca una página vacía
- Feedback inmediato: sonner para acciones, estados inline para formularios

---

## Protocolo de Ejecución

1. Antes de generar código, analizá qué componentes y dependencias necesitás
2. Si falta un paquete, instalalo con `npm install` sin preguntar
3. Investigá las capacidades reales de cada librería antes de usarla; usá sus funciones avanzadas, no reinventes la rueda
4. Generá código modular: un componente por archivo, hooks separados, tipos separados
5. Cada componente debe funcionar aislado y ser reutilizable
6. Nombres de carpetas y archivos en kebab-case: `user-profile/`, `use-media-query.ts`
7. Nombres de componentes en PascalCase: `UserProfile.tsx`, `HeroSection.tsx`
8. Antes de dar el código por terminado, revisá mentalmente: ¿cumple SOLID? ¿está limpio? ¿se ve profesional?

---

## Lo que NUNCA debés hacer

- Generar código con `any`
- Dejar TODO o FIXME sin resolver
- Usar `var` (siempre `const`, `let` solo si muta)
- Crear componentes de más de 150 líneas sin dividir
- Usar estilos inline (style={}) salvo casos dinámicos justificados
- Ignorar accesibilidad: todo interactivo necesita focus states y aria labels
- Generar UI genérica tipo "template gratuito de Bootstrap"
- Poner lógica de negocio dentro de componentes de UI
- Usar `useEffect` como primera solución; pensá si hay una alternativa más declarativa

## Seguridad — Reglas No Negociables

### Variables de Entorno
- Nunca hardcodees claves, tokens, secrets ni URLs sensibles en el código
- Todo dato sensible va en `.env.local` (desarrollo) o variables de entorno del hosting (producción)
- Prefijo `NEXT_PUBLIC_` solo para valores que el cliente NECESITA ver; si dudás, no lo pongas
- Siempre incluí `.env.local` en `.gitignore`; generá un `.env.example` con las claves vacías como referencia
- Validá que las variables de entorno existan al iniciar la app con un helper:

```ts
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
}
```

### Autenticación y Autorización
- Nunca implementes auth custom desde cero; usá soluciones probadas: NextAuth.js, Clerk, Supabase Auth o Auth0
- Tokens JWT se almacenan en httpOnly cookies, nunca en localStorage
- Validá el token en CADA request del servidor, no solo en el login
- Implementá refresh tokens con rotación automática
- Roles y permisos se validan server-side siempre; la UI solo oculta, no protege
- Cerrá sesiones inactivas con un TTL razonable

### Sanitización y Validación
- Validá TODA entrada del usuario tanto en cliente como en servidor
- Usá zod para schemas de validación: tipado + runtime validation en un solo paso
- Nunca confíes en datos que vienen del cliente: validá tipos, rangos, formatos y longitudes
- Escapá HTML para prevenir XSS; React lo hace por defecto, pero nunca uses `dangerouslySetInnerHTML` sin sanitizar con DOMPurify
- Parametrizá todas las queries a base de datos; nunca concatenes strings para armar SQL

### Headers y CORS
- Configurá headers de seguridad en `next.config.js`:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy` restrictivo según necesidad
- CORS: whitelist explícita de dominios permitidos, nunca `Access-Control-Allow-Origin: *` en producción
- Rate limiting en endpoints públicos y de auth con upstash/ratelimit o similar

### Dependencias
- No instales paquetes sin mantenimiento activo (último commit > 1 año = bandera roja)
- Preferí paquetes con tipado nativo sobre los que necesitan `@types/`
- Revisá que no haya vulnerabilidades conocidas: `npm audit` antes de mergear
- Mantené las dependencias actualizadas; usá versiones exactas en producción

---

## APIs — Arquitectura y Buenas Prácticas

### Estructura de Endpoints (App Router)
```
src/app/api/
├── auth/
│   └── [...nextauth]/route.ts
├── users/
│   ├── route.ts              # GET (list), POST (create)
│   └── [id]/
│       └── route.ts          # GET (detail), PUT (update), DELETE
└── health/
    └── route.ts              # Health check
```

### Convenciones REST
- Recursos en plural y kebab-case: `/api/user-profiles`, no `/api/getUserProfile`
- Verbos HTTP correctos: GET para leer, POST para crear, PUT/PATCH para actualizar, DELETE para eliminar
- Códigos de estado precisos: 200 (ok), 201 (created), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 422 (validation error), 500 (server error)
- Paginación con `?page=1&limit=20`, nunca devuelvas colecciones enteras sin límite
- Respuestas consistentes con un shape estándar:

```ts
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}
```

### Manejo de Errores
- Nunca expongas stack traces, mensajes internos ni estructura de DB al cliente
- Capturá errores en un handler centralizado, no try/catch sueltos en cada endpoint
- Logueá errores completos server-side (con contexto: userId, endpoint, payload sanitizado)
- Devolvé mensajes de error útiles pero genéricos al cliente: "No se pudo procesar la solicitud", no "Error en la columna X de la tabla Y"
- Implementá un error boundary global en el frontend para errores inesperados

```ts
function handleApiError(error: unknown): NextResponse {
  console.error("[API Error]", error);

  if (error instanceof ZodError) {
    return NextResponse.json(
      { success: false, data: null, error: "Datos inválidos" },
      { status: 422 }
    );
  }

  return NextResponse.json(
    { success: false, data: null, error: "Error interno del servidor" },
    { status: 500 }
  );
}
```

### Fetching en el Cliente
- Usá un wrapper tipado para fetch, no llames a `fetch()` crudo en cada componente
- Implementá retry automático con backoff exponencial para errores de red (máx 3 intentos)
- Cancelá requests con AbortController cuando el componente se desmonte
- Caché inteligente: usá React Query (TanStack Query) o SWR para server state; no guardes datos del servidor en useState
- Separá la capa de API en un directorio `services/` o `api/`:

```ts
// src/services/userService.ts
export async function fetchUserById(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new ApiError(response.status);
  const json: ApiResponse<User> = await response.json();
  if (!json.success || !json.data) throw new ApiError(422, json.error);
  return json.data;
}
```

### Llamadas a APIs Externas
- Toda API key de terceros va en variables de entorno server-side (sin `NEXT_PUBLIC_`)
- Las llamadas a APIs externas se hacen desde Route Handlers o Server Actions, nunca desde el cliente
- Implementá timeouts explícitos (máx 10s por defecto) para evitar requests colgados
- Cacheá respuestas cuando sea posible: `next.revalidate` o cache manual con Redis/Upstash
- Si la API externa tiene rate limits, implementá cola o throttling del lado del servidor
- Aislá cada integración en su propio archivo dentro de `services/external/`:

```
src/services/external/
├── openai.ts
├── supabase.ts
├── stripe.ts
└── resend.ts
```

### Base de Datos
- Usá un ORM tipado: Prisma o Drizzle ORM, nunca queries raw salvo optimizaciones justificadas
- Migraciones versionadas y reproducibles; nunca modifiques el schema a mano en producción
- Índices en columnas que se filtran o buscan frecuentemente
- Soft delete (`deletedAt`) sobre hard delete para datos críticos
- Conexiones con pool: nunca abras una conexión por request

---

## Lo que NUNCA debés hacer (Seguridad y APIs)

- Exponer API keys en el cliente o en repositorios públicos
- Confiar en validación solo del lado del cliente
- Devolver datos sensibles (passwords, tokens, datos de otros usuarios) en responses
- Usar `eval()`, `Function()` o `dangerouslySetInnerHTML` con datos no sanitizados
- Guardar passwords en texto plano; siempre hasheá con bcrypt o argon2
- Ignorar CORS, rate limiting o headers de seguridad
- Hacer deploy sin `.env.local` en `.gitignore`
- Loguear datos sensibles del usuario (emails, tokens, IPs sin anonimizar)