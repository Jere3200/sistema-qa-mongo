# Stack Tecnológico — Guía detallada para defensa

> Documento para explicar **cada herramienta, librería y dependencia** de RQA-Tracer
> en lenguaje simple, sin ser experto en programación.

---

## 📋 Índice

1. [El framework base](#1-el-framework-base)
2. [Autenticación y sesiones](#2-autenticación-y-sesiones)
3. [Base de datos](#3-base-de-datos)
4. [Componentes visuales (UI)](#4-componentes-visuales-ui)
5. [Estilos y diseño](#5-estilos-y-diseño)
6. [Formularios y validación](#6-formularios-y-validación)
7. [Animaciones y movimiento](#7-animaciones-y-movimiento)
8. [Utilidades y herramientas](#8-utilidades-y-herramientas)
9. [Seguridad](#9-seguridad)
10. [Extras y reporting](#10-extras-y-reporting)

---

## 1. El framework base

### **Next.js** (v16.2.4)
**¿Qué es?** El esqueleto de toda la app — la estructura que ordena cómo funciona.

**¿Para qué sirve?**
- Te deja hacer **frontend** (lo que ves en el navegador) y **backend** (la lógica del servidor) en un solo proyecto.
- Sin Next.js tendrías que armar dos proyectos separados (uno en React, otro en Node).
- Automáticamente genera las URLs y las páginas: si creás `app/dashboard/page.tsx`, eso **es** `/dashboard`.

**¿Cómo se usa en la app?**
- La estructura de carpetas en `app/` define las rutas (URLs).
- Las Server Actions (`'use server'`) permiten que el navegador llame funciones que corren en el servidor.
- El deploy automático en Vercel: cada vez que subes código, Next.js lo construye y publica.

**¿Por qué se eligió?**
- Es el estándar moderno de React (el framework de componentes).
- Todas las startups serias usan Next.js (Vercel, que lo hace, es la empresa detrás).

---

### **React** (v19)
**¿Qué es?** La librería que arma la interfaz del navegador con "componentes" (piezas reutilizables).

**¿Para qué sirve?**
- En lugar de escribir HTML "plano", escribís *componentes* (que son funciones JavaScript).
- Si algo cambia, React **automáticamente actualiza** la pantalla sin recargar la página.
- Ejemplo: el formulario de login es un componente que reacciona cuando escribís en los inputs.

**¿Cómo se usa en la app?**
- Cada archivo `.tsx` en la carpeta `components/` es un componente (botones, formularios, listas, etc.).
- Los componentes se **reutilizan**: el botón de "Enviar" se usa en login, registro, crear proyecto… una sola vez escrito, mil usos.

**¿Por qué se eligió?**
- React es lo más usado en el mundo para hacer interfaces web modernas.
- La comunidad es gigante: hay respuestas a casi todos los problemas.

---

### **React DOM** (v19)
**¿Qué es?** El "pegamento" que conecta React (que es solo lógica) con el navegador.

**¿Para qué sirve?**
- React genera componentes abstractos; React DOM los convierte en HTML real y los muestra en la pantalla.
- Sin React DOM, React no sabría cómo dibujar nada.

**¿Cómo se usa en la app?**
- No la tocás directamente — Next.js y React se encargan. Está ahí de fondo.

---

### **TypeScript** (5.7.3)
**¿Qué es?** JavaScript pero con "tipos" — avisa errores *antes* de que corras el código.

**¿Para qué sirve?**
- JavaScript normal permite cosas como `const x = "hola"; x.toUpperCase();` (OK) pero también `const x = "hola"; x.forEach(...)` (ERROR — los strings no tienen forEach).
- TypeScript **lo atrapa en el editor** y te dice "eso está mal" antes de que compile.
- Es como la diferencia entre escribir a mano y usar autocorrector: te evita typos.

**¿Cómo se usa en la app?**
- Todos los archivos `.ts` y `.tsx` son TypeScript.
- Defines tipos: `interface Usuario { id: string; nombre: string; }` y luego el editor **avisa si usás campos que no existen**.

**¿Por qué se eligió?**
- Evita bugs tontos (45% de los bugs en JavaScript son errores de tipos).
- Las grandes empresas lo usan (Microsoft, Google, Meta).

---

## 2. Autenticación y sesiones

### **NextAuth** (v5.0.0-beta.31)
**¿Qué es?** El sistema de login/sesiones — quién sos, si estás logueado, si te permito ver esto.

**¿Para qué sirve?**
- Gestiona el login: email+contraseña, Google, y mantiene la sesión activa.
- Genera el JWT (un "carné" cifrado que dice "este es Juan, está logueado, es usuario").
- Sin NextAuth tendrías que programar la seguridad desde cero (difícil, peligroso, lento).

**¿Cómo se usa en la app?**
- El archivo `auth.ts` configura que haya login por email+contraseña y por Google.
- El middleware (`middleware.ts`) chequea antes de cada página si estás logueado.
- Los componentes usan `useSession()` para saber quién sos.

**¿Por qué se eligió?**
- NextAuth es el estándar para Next.js (hecho por la misma gente).
- Es seguro: el equipo de NextAuth son expertos en seguridad.

---

### **@auth/prisma-adapter** (2.11.2)
**¿Qué es?** El "conector" entre NextAuth y tu base de datos (Prisma).

**¿Para qué sirve?**
- NextAuth maneja las sesiones, pero necesita **guardarlas en algún lado** (la base de datos).
- Este paquete es el puente: NextAuth le dice a Prisma "guarda esta sesión" y Prisma lo hace.

**¿Cómo se usa en la app?**
- En `auth.ts`, le decís a NextAuth "usa el adapter de Prisma".
- Luego NextAuth automáticamente guarda/lee sesiones de MongoDB.

---

### **bcryptjs** (3.0.3)
**¿Qué es?** La herramienta para **hashear contraseñas** (convertirlas en un número imposible de revertir).

**¿Para qué sirve?**
- Las contraseñas NUNCA se guardan en texto plano: `contraseña123` se convierte en `$2a$12$aBcDeFgHiJkLmNoPqRsTuVwXyZ...` (basura ilegible).
- Si un hacker roba la base de datos, no ve las contraseñas reales.
- bcrypt es la forma **estándar** de hacerlo (lo usan todos: Google, Facebook, etc.).

**¿Cómo se usa en la app?**
- En `register-action.ts` y `auth.ts`: cuando alguien registra o hace login, la contraseña se hashea.
- Al verificar, se compara el hash guardado con el que genera la contraseña ingresada.

**¿Por qué se eligió?**
- Es lento a propósito: ralentiza los ataques de fuerza bruta (probar 1000 contraseñas te tarda 10 horas en lugar de 1 segundo).

---

## 3. Base de datos

### **Prisma** (5.22.0)
**¿Qué es?** El "traductor" entre tu código JavaScript y la base de datos MongoDB.

**¿Para qué sirve?**
- Sin Prisma, escribirías consultas directas a MongoDB (difícil, fácil de equivocarse).
- Con Prisma, escribís `prisma.project.create({ ... })` y Prisma convierte eso en la consulta correcta.
- Además, **valida tipos**: si le pasás un número donde debe ir un string, te avisa.

**¿Cómo se usa en la app?**
- El archivo `prisma/schema.prisma` **define las tablas** (User, Project, UserStory, TestCase, etc.).
- En `lib/db/*.ts` escribís consultas: `prisma.user.findUnique(...)`, `prisma.project.update(...)`.
- Prisma automáticamente convierte eso en MongoDB queries.

**¿Por qué se eligió?**
- Prisma es el ORM más seguro (previene inyección SQL/NoSQL automáticamente).
- Tipado automático: si cambias el schema, el editor avisa dónde rompió el código.
- Funciona con cualquier base de datos (SQL, MongoDB, PostgreSQL…).

---

### **@prisma/client** (5.22.0)
**¿Qué es?** El cliente de Prisma — el código que *realmente* habla con la base de datos.

**¿Para qué sirve?**
- Prisma (el ORM) genera automáticamente el cliente basado en el schema.
- Sin el cliente, Prisma es solo declaraciones; con él, se ejecutan.

**¿Cómo se usa en la app?**
- Se importa en `lib/prisma.ts`: `import { PrismaClient } from '@prisma/client'`.
- Luego se usa en `lib/db/*.ts` para hacer consultas.

---

## 4. Componentes visuales (UI)

### **@radix-ui/react-*** (múltiples)
**¿Qué es?** Una librería de componentes **sin estilos**, solo funcionalidad y accesibilidad.

**¿Para qué sirve?**
- Radix UI proporciona componentes "crudos" (botones, diálogos, selects, etc.) pero SIN CSS.
- Tú agregas los estilos con Tailwind.
- Es como comprar un mueble "sin pintar" — vos lo pintas.

**Componentes que usamos:**
- `react-accordion` → acordeones desplegables.
- `react-alert-dialog` → diálogos de "¿estás seguro?".
- `react-button` → botón base (aunque usamos HeroUI).
- `react-dialog` → ventanas modales.
- `react-select` → desplegables.
- `react-tabs` → pestañas.
- `react-slider` → controles deslizantes.
- Etc. (hay 20+).

**¿Cómo se usa en la app?**
- En `components/ui/` hay componentes "copiados" de Radix: `button.tsx`, `dialog.tsx`, etc.
- Se importan y se usan en componentes de negocio.

**¿Por qué se eligió?**
- Radix UI es **accesible** por defecto (funciona con teclado, lectores de pantalla, etc.).
- La filosofía de "unstyled" te da control total.

---

### **@heroui/react** (2.8.10)
**¿Qué es?** Componentes UI **listos para usar** con estilos incluidos.

**¿Para qué sirve?**
- A diferencia de Radix UI, HeroUI viene con CSS — diseño profesional automático.
- Se usa en formularios: Input, Button, Select, etc.

**¿Cómo se usa en la app?**
- En `app/login/page.tsx`, `app/register/page.tsx` y otros formularios.
- `<Input label="Email" />` → input con label, validación, estilos automáticos.

**¿Por qué se eligió?**
- Diseño limpio y moderno sin tener que escribir CSS manualmente.
- Buen balance entre control y conveniencia.

---

### **Lucide React** (0.564.0)
**¿Qué es?** Una librería de **iconos** — dibujitos pequeños para representar acciones.

**¿Para qué sirve?**
- En lugar de buscar imágenes PNG, usas componentes: `<Settings />`, `<LogOut />`, `<Plus />`.
- Los iconos son vectores (se ven bien en cualquier tamaño).

**¿Cómo se usa en la app?**
- En botones, menúes, navbar. Ejemplo: `<Button><Plus /> Nuevo</Button>`.

**¿Por qué se eligió?**
- Está integrado con React: `import { Plus } from 'lucide-react'`.
- Sirve a cualquier resolución sin perder calidad.

---

## 5. Estilos y diseño

### **Tailwind CSS** (4.2.0)
**¿Qué es?** Un sistema de clases de CSS para estilizar sin escribir CSS manualmente.

**¿Para qué sirve?**
- Método tradicional: escribís `.button { background: teal; padding: 10px; }` en un archivo CSS.
- Con Tailwind: escribís `<button className="bg-teal-600 px-3 py-2">` directamente en el HTML.
- Cada clase es una propiedad CSS pequeña: `bg-` = background, `px-` = padding horizontal, etc.

**¿Cómo se usa en la app?**
- Casi en cada componente: `className="flex gap-4 text-gray-900 text-lg"`.
- Sin Tailwind, tendrías que escribir miles de líneas de CSS.

**¿Por qué se eligió?**
- Desarrollo más rápido: no necesitas archivo CSS separado.
- Consistencia automática: si defines los colores en `tailwind.config.js`, todos usan lo mismo.
- Comunidad gigante: ejemplos y preguntas en Stack Overflow.

---

### **Autoprefixer** (10.4.20)
**¿Qué es?** Una herramienta que automáticamente agrega prefijos a CSS para navegadores viejos.

**¿Para qué sirve?**
- Algunos navegadores viejos necesitan `-webkit-`, `-moz-` para entender ciertas propiedades.
- Autoprefixer lo hace automáticamente — escribís normal, él agrega los prefijos.

**¿Cómo se usa en la app?**
- Corre como parte del build: no tocás nada, pasa detrás de escena.

---

### **PostCSS** (8.5)
**¿Qué es?** Un procesador de CSS — transforma CSS en otros CSS.

**¿Para qué sirve?**
- Tailwind **es un plugin de PostCSS** — PostCSS ejecuta Tailwind.
- También ejecuta Autoprefixer.

**¿Cómo se usa en la app?**
- En el build: Next.js corre PostCSS que corre Tailwind que genera las clases.

---

### **tailwind-merge** (3.3.1)
**¿Qué es?** Herramienta para **mezclar clases de Tailwind sin conflictos**.

**¿Para qué sirve?**
- Si un componente tiene `className="px-4"` y le pasás `className="px-8"`, con tailwind-merge se fusionan inteligentemente (gana `px-8`).
- Sin esto, tendrías duplicados y conflictos.

**¿Cómo se usa en la app?**
- Se usa en la función `cn()` (en `lib/cn.ts` o similar) que es helpers para combinar clases.

---

### **class-variance-authority** (0.7.1)
**¿Qué es?** Sistema para definir **variantes de componentes** (botón primario, secundario, peligro…).

**¿Para qué sirve?**
- Botón normal vs. botón peligro: algunos estilos cambian, otros no.
- CVA te deja definir esas variantes de forma clara.

**¿Cómo se usa en la app?**
- En componentes de shadcn/ui como el botón.

---

### **clsx** (2.1.1)
**¿Qué es?** Utilidad para **condicionalmente aplicar clases** de CSS.

**¿Para qué sirve?**
- Si algo tiene error, quieres la clase `border-red-500`, si no `border-gray-300`.
- Sin clsx: `className={error ? "border-red-500" : "border-gray-300"}` (feo).
- Con clsx: `clsx("border", error && "border-red-500", !error && "border-gray-300")` (más limpio).

**¿Cómo se usa en la app?**
- En componentes que tienen estados (activo/inactivo, error/ok, cargando/hecho).

---

## 6. Formularios y validación

### **React Hook Form** (7.54.1)
**¿Qué es?** Librería para **manejar formularios** de forma eficiente en React.

**¿Para qué sirve?**
- Sin React Hook Form, un formulario es complejo: estado para cada input, validaciones, envío…
- Con React Hook Form: registras los inputs, los validás, y listo.
- Es mucho más rápido y usa menos memoria.

**¿Cómo se usa en la app?**
- En formularios de login, registro, crear proyecto, etc.
- `const { register, handleSubmit, errors } = useForm()`.

**¿Por qué se eligió?**
- Es la librería de formularios más usada en React.
- Soporta validaciones complejas.

---

### **@hookform/resolvers** (3.9.1)
**¿Qué es?** El conector entre React Hook Form y librerías de validación (como Zod).

**¿Para qué sirve?**
- React Hook Form maneja el formulario, pero necesita reglas de validación.
- Este paquete conecta React Hook Form con Zod (que define esas reglas).

**¿Cómo se usa en la app?**
- En formularios: `const { control } = useForm({ resolver: zodResolver(schema) })`.

---

### **Zod** (3.24.1)
**¿Qué es?** Librería para **definir y validar datos** de forma segura.

**¿Para qué sirve?**
- Defines un "esquema": `const schema = z.object({ email: z.string().email(), age: z.number().min(0) })`.
- Luego validás datos: `schema.parse({ email: "test@test.com", age: 25 })` → OK o ERROR.
- Si es error, te dice qué está mal.

**¿Cómo se usa en la app?**
- En `lib/validations/*.ts`: esquemas para usuarios, proyectos, historias, casos de prueba.
- En Server Actions: antes de guardar en la DB, validás con Zod.

**¿Por qué se eligió?**
- Zod es TypeScript-first: los esquemas se convierten automáticamente en tipos.
- Es la forma segura de validar (todos los grandes la usan).

---

## 7. Animaciones y movimiento

### **Framer Motion** (12.38.0)
**¿Qué es?** Librería para **animar elementos** en el navegador.

**¿Para qué sirve?**
- Sin animaciones, la app es "teleports": haces clic y algo aparece sin transición.
- Con Framer Motion: transiciones suaves, entrada gradual, movimientos.

**¿Cómo se usa en la app?**
- `<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>` → aparece el div lentamente.
- En la landing: animaciones de entrada de las tarjetas, contadores, etc.
- En página de transición: fade-in/slide-up al cambiar de ruta.

**¿Por qué se eligió?**
- Framer Motion es la librería de animaciones más potente para React.
- Rendimiento: anima en 60fps sin ralentizar.

---

## 8. Utilidades y herramientas

### **date-fns** (4.1.0)
**¿Qué es?** Librería para **trabajar con fechas** (formateo, cálculos, etc.).

**¿Para qué sirve?**
- JavaScript nativo es difícil para fechas.
- date-fns: `format(new Date(), 'dd/MM/yyyy')` → "24/12/2025".
- Cálculos: `addDays(date, 7)` → 7 días después.

**¿Cómo se usa en la app?**
- En dashboard: mostrar fechas de creación, última modificación, etc.

---

### **React Day Picker** (9.13.2)
**¿Qué es?** Componente calendario para **seleccionar fechas**.

**¿Para qué sirve?**
- Input de fecha común: `<input type="date">` es feo.
- Day Picker: un calendario bonito para elegir la fecha.

**¿Cómo se usa en la app?**
- En formularios si necesitás que el usuario elija una fecha.

---

### **Recharts** (2.15.0)
**¿Qué es?** Librería para **gráficos y visualizaciones**.

**¿Para qué sirve?**
- Dashboard: mostrar % de pruebas, distribución de estados, etc.
- Sin Recharts: tendrías que dibujar gráficos en Canvas (muy difícil).

**¿Cómo se usa en la app?**
- En dashboard: `<BarChart data={data}><Bar dataKey="name" /></BarChart>`.

---

### **Sonner** (1.7.1)
**¿Qué es?** Librería para **notificaciones toast** (mensajitos que aparecen abajo).

**¿Para qué sirve?**
- Cuando haces clic en "Crear proyecto" y se guarda, aparece un "✓ Proyecto creado".
- Sin Sonner: tendrías que hacer un componente de notificación complejo.

**¿Cómo se usa en la app?**
- `toast.success("Proyecto creado")` — aparece y desaparece automáticamente.

---

### **Vaul** (1.1.2)
**¿Qué es?** Componente para **drawers** (paneles que se deslizan desde un lado).

**¿Para qué sirve?**
- En mobile: en lugar de modales (ventanas), es mejor un panel que se desliza desde abajo.
- Drawer: menos intrusivo que un modal.

**¿Cómo se usa en la app?**
- En componentes como `UserDrawer` para crear/editar usuarios.

---

### **CMDk** (1.1.1)
**¿Qué es?** Componente para **paleta de comandos** (Ctrl+K → buscar comandos).

**¿Para qué sirve?**
- Como Spotlight en Mac o Ctrl+P en VS Code: busca y ejecuta.
- Si la app crece, puedes agregar "Ir a proyecto X" o "Crear historia Y" con Ctrl+K.

---

### **Embla Carousel** (8.6.0)
**¿Qué es?** Componente para **carruseles** (galerías que se deslizan).

**¿Para qué sirve?**
- Si quieres mostrar proyectos de forma deslizable (1, 2, 3 y luego arrastra).
- Sin Embla: programar un carrusel es complejo.

---

### **jsPDF** (4.2.1) + **jsPDF Autotable** (5.0.7)
**¿Qué es?** Librerías para **generar PDFs desde JavaScript**.

**¿Para qué sirve?**
- Exportar la trazabilidad o un reporte a PDF.
- Sin jsPDF: tendrías que generar PDFs en el servidor (más lento).

**¿Cómo se usa en la app?**
- En botones de "Descargar como PDF": arma un PDF con los datos y lo descarga.

---

### **Input OTP** (1.4.2)
**¿Qué es?** Componente para **entrada de códigos OTP** (6 dígitos, verificación de dos factores).

**¿Para qué sirve?**
- Código de verificación: 6 inputs pequeñitos que se autorellenan.
- Sin Input OTP: tendrías que hacerlo a mano.

---

### **Swagger UI React** (5.32.6)
**¿Qué es?** Visualizador interactivo para la **documentación de APIs**.

**¿Para qué sirve?**
- La página `/docs` muestra interactivamente cómo usar la API (qué parámetros, qué responde, etc.).
- Es como el "manual" de la API, pero ejecutable.

**¿Cómo se usa en la app?**
- En `app/docs/page.tsx`: carga la spec OpenAPI y la muestra bonita.

---

### **React Resizable Panels** (2.1.7)
**¿Qué es?** Componente para **paneles redimensionables** (arrastra la línea divisora para agrandar/achicar).

**¿Para qué sirve?**
- Dashboard de dos columnas: una para lista, otra para detalles. Arrastras para ajustar tamaño.

---

## 9. Seguridad

### **Turnstile (react-turnstile)** (1.5.3)
**¿Qué es?** Widget de Cloudflare para **verificar que no sos un bot** (CAPTCHA moderno).

**¿Para qué sirve?**
- Protege login y registro contra bots y fuerza bruta.
- "No soy un robot" pero moderno: a veces solo te pide un click, a veces un puzzle.

**¿Cómo se usa en la app?**
- En `app/login/page.tsx` y `app/register/page.tsx`: componente `<TurnstileWidget>`.

---

### **Resend** (6.14.0)
**¿Qué es?** Servicio para **enviar emails** desde tu app.

**¿Para qué sirve?**
- Email de recuperación de contraseña, bienvenida, notificaciones, etc.
- Sin Resend: tendrías que configurar un servidor de emails (Gmail, SendGrid…) complicado.

**¿Cómo se usa en la app?**
- En `lib/services/email.ts`: `resend.emails.send({ from: "...", to: "...", subject: "...", html: "..." })`.
- Cuando el usuario pide reset de contraseña, se envía un email.

---

## 10. Extras y reporting

### **Vercel Analytics** (1.6.1)
**¿Qué es?** Herramienta para **medir performance** de la app.

**¿Para qué sirve?**
- Cuánta gente entra, de dónde, qué tan rápido carga, etc.
- Sin Analytics: sabes que existe pero no cuánto se usa.

**¿Cómo se usa en la app?**
- Se integra automáticamente en `next.config.mjs`: manda datos anónimos a Vercel.

---

### **Next Themes** (0.4.6)
**¿Qué es?** Librería para **cambiar entre modo claro y oscuro**.

**¿Para qué sirve?**
- Oscuro en la noche, claro en el día. Sistema operativo decide automáticamente.
- Sin Next Themes: tendrías que programar la lógica de temas.

**¿Cómo se usa en la app?**
- En `app/layout.tsx`: `<ThemeProvider>` envuelve la app.
- El usuario puede cambiar tema en un botón.

---

## 📊 Resumen por categoría

| Categoría | Librerías | Qué hacen |
|---|---|---|
| **Core** | Next.js, React, TypeScript | Arman la estructura de la app. |
| **Auth** | NextAuth, bcryptjs, Turnstile | Login, sesiones, CAPTCHA. |
| **DB** | Prisma, MongoDB Atlas | Guardan y recuperan datos. |
| **UI** | Radix UI, HeroUI, Lucide | Componentes visuales y iconos. |
| **Estilos** | Tailwind, Autoprefixer | CSS sin escribir CSS. |
| **Formularios** | React Hook Form, Zod | Capturan datos y validan. |
| **Animaciones** | Framer Motion | Transiciones suaves. |
| **Utilidades** | date-fns, Recharts, Sonner | Fechas, gráficos, notificaciones. |
| **Seguridad** | bcryptjs, Turnstile, Resend | Contraseñas, CAPTCHA, emails. |

---

## 🎯 Frase para el profe

> "El stack de RQA-Tracer es moderno y profesional. **Next.js** es el framework frontend+backend,
> **React** arma los componentes, **TypeScript** evita errores, **Prisma** habla con **MongoDB**,
> **Tailwind** estiliza, **NextAuth** maneja la seguridad, **Zod** valida datos, **Framer Motion**
> anima, y **Turnstile**+**Resend** protegen e informan. Cada librería resuelve un problema específico
> — nada está de relleno."

---

## ¿Por qué cada librería y no sus "competidoras"?

| Librería | ¿Por qué no...? |
|---|---|
| **Next.js** | ¿Gatsby? Gatsby es para sitios estáticos (blogs). Next.js es para apps dinámicas. |
| **React** | ¿Vue o Svelte? React tiene la comunidad más grande; soluciones a cualquier problema. |
| **TypeScript** | ¿JavaScript puro? Riesgoso — los errores se descubren en producción, no en desarrollo. |
| **Prisma** | ¿Sequelize o TypeORM? Prisma tiene mejor tipado automático. |
| **Tailwind** | ¿Bootstrap? Bootstrap es más pesado; Tailwind es más flexible. |
| **NextAuth** | ¿Auth0 o Supabase Auth? NextAuth es gratis, open-source, control total. |
| **Zod** | ¿Yup o Joi? Zod es TypeScript-first y más ligero. |
| **Framer Motion** | ¿React Spring? Framer Motion es más intuitivo y potente. |

---

## Deploy y hospedaje

### **Vercel**
**¿Qué es?** El servidor donde vive la app.

**¿Para qué sirve?**
- Sin Vercel: tendrías que alquilar un servidor AWS, configurarlo, mantenerlo.
- Vercel: subes código a GitHub, Vercel automáticamente lo construye y publica. Es automático.

**¿Cómo funciona?**
- Cada vez que hacés `git push`, Vercel:
  1. Descarga el código.
  2. Corre `npm install` (instala librerías).
  3. Corre `npm run build` (compila Next.js + TypeScript).
  4. Publica en sus servidores.
  5. La app está viva en `sistema-qa-mongo.vercel.app`.

**¿Por qué se eligió?**
- Vercel hizo Next.js — lo entienden mejor que nadie.
- Precio perfecto para proyecto académico (gratis).

---

### **MongoDB Atlas**
**¿Qué es?** La base de datos en la nube.

**¿Para qué sirve?**
- Base de datos = lugar donde guardás proyectos, usuarios, historias, etc.
- Atlas = MongoDB hospedado en la nube (no tenés que mantener un servidor).

**¿Cómo funciona?**
- Prisma conecta a MongoDB Atlas (conexión segura con contraseña).
- Guardás datos: `prisma.project.create({ name: "Proyecto 1", ... })`.
- Los datos viven en MongoDB, no en tu compu.

**¿Por qué se eligió?**
- MongoDB es NoSQL — flexible, sin tablas rígidas.
- Atlas es oficial: bajo mantenimiento, seguridad garantizada.

---

## 🔒 Resumen de seguridad

| Herramienta | Qué protege |
|---|---|
| **bcryptjs** | Contraseñas hasheadas (no se guardan en texto plano). |
| **NextAuth** | Sesiones seguras en cookies httpOnly (JavaScript no puede leerlas). |
| **Zod** | Valida datos en el servidor (rechaza entrada malformada). |
| **Turnstile** | CAPTCHA — frena bots. |
| **Prisma** | Parametriza consultas — evita inyección NoSQL. |
| **TypeScript** | Errores en desarrollo, no en producción. |
| **Vercel** | HTTPS automático, headers de seguridad. |

---

## 💾 Instalación y construcción

### Scripts (en `package.json`)
```bash
npm run dev       # Corre la app localmente (http://localhost:3000)
npm run build     # Compila TypeScript y Next.js → carpeta .next
npm start         # Inicia la app compilada (para producción local)
npm run lint      # Busca errores de código (ESLint)
```

### El build
Cuando hacés `npm run build`:
1. `prisma generate` — regenera el cliente de Prisma (lee `schema.prisma`).
2. `next build` — compila React, TypeScript, Tailwind.
3. Resultado: carpeta `.next` lista para Vercel.

---

## 📝 Conclusión

RQA-Tracer usa **el stack más moderno y seguro** posible para una app de trazabilidad QA:
- **Next.js + React** → interfaz rápida y responsiva.
- **TypeScript** → código sin errores.
- **MongoDB + Prisma** → datos confiables y seguros.
- **NextAuth + bcryptjs** → autenticación empresa-grade.
- **Tailwind** → diseño profesional sin CSS manual.
- **Zod** → validación de datos robusta.
- **Vercel + Turnstile + Resend** → infraestructura segura y comunicación.

Todo está pensado para **escala**, **seguridad** y **mantenibilidad**. No hay atajos: cada decisión es profesional.
