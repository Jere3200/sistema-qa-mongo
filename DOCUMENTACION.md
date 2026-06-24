# RQA-Tracer — Documentación del proyecto

> Guía pensada para **explicar y defender** el sistema sin ser experto. Está en lenguaje
> simple, con analogías. Si te preguntan algo, buscá la sección y vas a tener la respuesta.

---

## 1. ¿Qué es y qué problema resuelve?

**RQA-Tracer** es una aplicación web para gestionar la **calidad de software (QA)** y la
**trazabilidad de requisitos**.

**El problema que resuelve:** cuando un equipo desarrolla un sistema, escribe *requisitos*
(lo que el software tiene que hacer) y *pruebas* (cómo se verifica que funciona). El riesgo
es que un requisito quede **sin probar** y nadie lo note. RQA-Tracer conecta cada requisito
con sus pruebas y muestra, en una matriz visual, qué está cubierto y qué no.

**La regla central del sistema:**
> Una **historia de usuario** (requisito) no se puede marcar como **"Completada"**
> hasta que tenga **al menos un caso de prueba aprobado**.

Esto obliga a que "terminado" signifique "probado y funcionando", no solo "lo programé".
Esta regla está validada **en el servidor**, así que no se puede saltear desde el navegador.

---

## 2. Glosario rápido (en criollo)

| Término | Qué es, en simple |
|---|---|
| **Frontend** | Lo que ves y tocás en el navegador (pantallas, botones). |
| **Backend** | La lógica que corre en el servidor (guarda datos, valida, autentica). |
| **Base de datos** | Donde se guardan los datos de forma permanente (como un Excel gigante y ordenado). |
| **API** | La "puerta" por la que el frontend le pide o manda datos al backend. |
| **Autenticación** | Verificar **quién sos** (login). |
| **Autorización** | Verificar **qué te está permitido hacer** (¿sos admin? ¿es tu proyecto?). |
| **Historia de usuario** | Un requisito escrito como "Como [rol], quiero [acción], para [beneficio]". |
| **Caso de prueba** | Un escenario para verificar un requisito (formato Gherkin: Dado/Cuando/Entonces). |
| **Trazabilidad** | La conexión visible entre cada requisito y sus pruebas. |
| **Deploy** | Publicar la app en internet para que otros la usen. |

---

## 3. Stack tecnológico (qué se usó y por qué)

Pensalo como las "herramientas" con las que está construida la app:

| Tecnología | Qué es | Por qué se usó |
|---|---|---|
| **Next.js** (React) | El framework principal: arma el frontend **y** el backend en un solo proyecto. | Es el estándar moderno; permite páginas rápidas y lógica de servidor sin montar dos proyectos separados. |
| **TypeScript** | JavaScript con "tipos" (avisa errores antes de ejecutar). | Evita bugs tontos y hace el código más seguro y mantenible. |
| **Tailwind CSS** | Forma de dar estilos con clases cortas. | Diseño rápido y consistente. |
| **shadcn/ui + HeroUI** | Componentes visuales listos (botones, diálogos, tablas). | No reinventar la rueda; UI profesional. |
| **Framer Motion** | Librería de animaciones. | Las transiciones y movimientos del sitio. |
| **MongoDB Atlas** | La base de datos (en la nube). | Guarda usuarios, proyectos, historias, pruebas, mensajes, etc. |
| **Prisma** | Un "traductor" entre el código y la base de datos (ORM). | Permite leer/escribir datos de forma segura y tipada, sin escribir consultas a mano. |
| **NextAuth (Auth.js v5)** | Sistema de login/sesiones. | Login con email+contraseña y con Google, sin programar la seguridad desde cero. |
| **Resend** | Servicio de envío de emails. | Manda el correo de recuperación de contraseña. |
| **Cloudflare Turnstile** | CAPTCHA (verificación "no soy un robot"). | Frena bots en login y registro. |
| **Zod** | Librería de validación de datos. | Revisa que los datos que llegan sean correctos (en el servidor). |
| **Vercel** | El hosting donde está publicada la app. | Deploy automático cada vez que se sube código a GitHub. |

> **Frase para defender el stack:** "Usé Next.js porque unifica frontend y backend, Prisma
> para hablar con MongoDB de forma segura, NextAuth para no implementar la seguridad de
> sesiones a mano, y Vercel para el deploy automático."

---

## 4. Cómo está organizada (arquitectura simple)

La app sigue el patrón moderno de Next.js. Lo importante:

- **Las páginas** viven en la carpeta `app/` (cada carpeta es una URL).
- **La lógica de datos** vive en `lib/db/` como **"Server Actions"**: funciones que el
  navegador llama, pero que **se ejecutan en el servidor** (ahí está Prisma y la base de datos).
- **La autorización** se chequea en `lib/db/access.ts` (¿hay sesión? ¿este proyecto es tuyo?).
- **Las validaciones** están en `lib/validations/` (con Zod).

**Flujo de un ejemplo ("crear un proyecto"):**
1. Hacés clic en "Nuevo proyecto" en el navegador (frontend).
2. Se llama a la Server Action `createProject` (corre en el servidor).
3. El servidor verifica que estés logueado, valida los datos con Zod, y guarda en MongoDB con Prisma.
4. La pantalla se actualiza con el proyecto nuevo.

> **Clave de seguridad:** el navegador **nunca** habla directo con la base de datos. Todo pasa
> por el servidor, que valida quién sos y qué podés hacer. Por eso no se puede "hacer trampa"
> desde el navegador.

---

## 5. Funcionalidades (qué hace cada parte)

### 5.1. Cuentas y acceso
- **Registro** con nombre, email y contraseña.
- **Login** con email+contraseña **o** con **Google** (un clic).
- **Recuperación de contraseña** por email (con un enlace que expira en 1 hora).
- **Roles:**
  - **Admin** (`jfjerefernandez@gmail.com`): puede gestionar usuarios (crear, editar, eliminar).
  - **Usuario** normal: usa la app pero no ve ni toca la lista de usuarios.

### 5.2. Núcleo QA (el corazón de la app)
La jerarquía es: **Proyecto → Módulos → Historias de usuario → Casos de prueba.**

- **Proyectos:** el contenedor de todo. Se pueden crear, editar, archivar y eliminar.
- **Módulos:** dividen un proyecto en partes (ej. "Login", "Pagos").
- **Historias de usuario:** los requisitos, en formato *"Como… quiero… para…"*, con
  **criterios de aceptación** (condiciones para darla por buena). Cada una recibe un código
  automático (US-001, US-002…).
- **Casos de prueba:** escenarios en formato **Gherkin** (Dado / Cuando / Entonces),
  vinculados a una historia. Código automático (TC-001…). Se pueden **ejecutar** y marcar
  como Aprobado, Fallido, Bloqueado o Pendiente.

### 5.3. Trazabilidad y Dashboard
- **Matriz de trazabilidad:** una grilla que cruza historias × casos de prueba y muestra la
  **cobertura** (qué está probado y qué no).
- **Regla de completitud:** una historia no pasa a "Completada" si no tiene un caso de prueba
  aprobado (validado en el servidor).
- **Dashboard:** resumen con números clave (proyectos, historias, pruebas, % de cobertura) y
  gráficos de estado.

### 5.4. Colaboración
- **Miembros de proyecto:** el dueño puede invitar colaboradores por email.
- **Comentarios** en historias y casos de prueba.
- **Chat por proyecto** y **mensajes directos** entre usuarios (con notificación de mensajes
  nuevos). Se actualizan por *polling* (el navegador pregunta cada pocos segundos si hay algo nuevo).

### 5.5. Documentación de la API
- Hay una página `/docs` con la documentación interactiva (Swagger) de la API de usuarios.

---

## 6. Seguridad (lo que el profe va a intentar romper)

Esta es la sección más importante para defender. Cada fila es **un ataque** y **cómo está frenado**.

| Ataque que podrían intentar | Cómo está protegido |
|---|---|
| **Entrar sin login** a una página privada | Un *middleware* protege todas las rutas: si no hay sesión, te manda al login. |
| **Robar la sesión** | La sesión se guarda en una **cookie httpOnly** (el JavaScript del navegador no puede leerla). Expira a los 7 días. |
| **Adivinar/forzar la contraseña** (fuerza bruta) | **Rate limiting**: máx. 20 intentos de login cada 15 min por IP. Además **CAPTCHA** (Turnstile). |
| **Ver/editar datos de otro usuario** (IDOR) | Cada operación verifica que seas **dueño o miembro** del proyecto antes de leer o escribir. |
| **Acción de admin sin ser admin** (escalar privilegios) | El rol se valida **en el servidor** en cada acción sensible; la API de usuarios devuelve 403 si no sos admin. El registro nunca puede crear admins. |
| **Inyectar datos basura** (ej. un estado inválido que rompa la UI) | **Validación con Zod en el servidor**: rechaza valores fuera de los permitidos, vacíos o demasiado largos. |
| **Inyección SQL / NoSQL** | Se usa **Prisma**, que parametriza todo. Nunca se arman consultas concatenando texto del usuario. |
| **XSS** (inyectar HTML/JS malicioso) | React **escapa** todo el texto por defecto. Además una **CSP** (política de seguridad) bloquea scripts no autorizados. |
| **Saltear la regla** (completar historia sin prueba aprobada) | Validado en el servidor: la acción rechaza el cambio si no hay un caso aprobado. |
| **Spam de emails de recuperación** | Rate limiting (5/15min por IP, 3/15min por email) y respuesta **anti-enumeración** (no revela si el email existe). |
| **Averiguar qué emails están registrados** (enumeración) | Tanto el reset como el registro responden **igual** exista o no la cuenta. |
| **Contraseñas filtradas si roban la base** | Las contraseñas se guardan **hasheadas con bcrypt** (12 rondas), nunca en texto plano. |
| **Redirección maliciosa** tras login (open redirect) | El destino del redirect se valida: solo rutas internas. |
| **Envenenar el link de reset** (host header injection) | El enlace del email se arma desde una URL de confianza configurada, no desde la petición. |
| **Clickjacking** (meter la app en un iframe) | Header `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'`. |

**Otras medidas:** headers de seguridad (HSTS, nosniff, Referrer-Policy), secretos en variables
de entorno (nunca en el código), y el acceso a MongoDB protegido por usuario y contraseña.

> **Frase para defender la seguridad:** "Toda la lógica sensible corre en el servidor. El
> navegador solo muestra; nunca decide. Validamos quién sos, qué podés hacer y que los datos
> sean correctos en cada operación. Además hay rate limiting, CAPTCHA y contraseñas hasheadas."

---

## 7. Cómo defenderlo: preguntas típicas y respuestas

**¿Por qué Next.js y no [otra cosa]?**
Porque unifica frontend y backend en un proyecto, es el estándar de la industria con React, y
se integra perfecto con Vercel para el deploy.

**¿Dónde está la lógica de negocio?**
En el servidor, en `lib/db/` (Server Actions). El navegador solo dispara esas funciones.

**¿Cómo evitás que un usuario edite el proyecto de otro?**
Antes de cada lectura/escritura, el servidor verifica que sea dueño o miembro del proyecto
(`assertProjectAccess`). Si no, la operación se rechaza.

**¿Qué pasa si alguien llama a la función del servidor "a mano" salteando la pantalla?**
Igual está protegido: la validación, la autorización y la regla de negocio están en el servidor,
no en el navegador. Deshabilitar un botón en la UI es solo cosmético; lo que protege es el backend.

**¿Las contraseñas cómo se guardan?**
Hasheadas con bcrypt (no se pueden "des-hashear"). Ni nosotros vemos la contraseña real.

**¿Por qué el chat no es "en tiempo real" instantáneo?**
Porque la base es MongoDB (no tiene realtime nativo como otros servicios). Se resuelve con
*polling*: el navegador consulta cada pocos segundos. Es una decisión técnica consciente.

**¿Qué es la "regla" del sistema y por qué importa?**
Que no se pueda completar una historia sin una prueba aprobada. Importa porque obliga a que
"terminado" signifique "probado", que es justamente el objetivo de una herramienta de QA.

---

## 8. Mapa de archivos clave (por si te preguntan "¿dónde está X?")

| Funcionalidad | Archivo principal |
|---|---|
| Configuración de login/sesiones | `auth.ts` |
| Protección de rutas | `middleware.ts` |
| Modelo de datos (tablas) | `prisma/schema.prisma` |
| Acciones de proyectos/módulos/historias/casos | `lib/db/*.ts` |
| Control de acceso (autorización) | `lib/db/access.ts` |
| Validaciones (Zod) | `lib/validations/` |
| Rate limiting | `lib/rate-limit.ts` |
| Envío de emails | `lib/services/email.ts` |
| CAPTCHA | `lib/services/turnstile.ts` + `components/auth/turnstile-widget.tsx` |
| Headers de seguridad / CSP | `next.config.mjs` |
| Páginas (URLs) | carpeta `app/` |

---

### Resumen de una línea para arrancar la defensa
> "RQA-Tracer es una app web de trazabilidad de QA hecha con Next.js, Prisma y MongoDB, que
> conecta cada requisito con sus pruebas y **garantiza, desde el servidor, que nada se marque
> como terminado sin estar probado** — con seguridad robusta en autenticación, autorización y
> validación."
