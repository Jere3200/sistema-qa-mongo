import { NextResponse } from 'next/server'

const spec = {
  openapi: '3.0.0',
  info: {
    title: 'RQA-Tracer API',
    version: '1.0.0',
    description:
      'API REST del sistema de trazabilidad de requisitos y calidad. Autenticación mediante sesión de Auth.js v5 (cookie httpOnly). Todos los endpoints requieren sesión activa.',
  },
  servers: [{ url: '/api', description: 'Servidor local' }],
  components: {
    schemas: {
      UserItem: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', nullable: true, example: 'Ana García' },
          email: { type: 'string', nullable: true, example: 'ana@ejemplo.com' },
        },
      },
      CreateUserBody: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Juan Pérez' },
          email: { type: 'string', format: 'email', example: 'juan@ejemplo.com' },
          password: { type: 'string', minLength: 6, example: 'secreto123' },
        },
      },
      UpdateUserBody: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: { type: 'string', example: 'Juan Pérez' },
          email: { type: 'string', format: 'email', example: 'juan@ejemplo.com' },
          password: {
            type: 'string',
            minLength: 6,
            example: '',
            description: 'Dejar vacío para no cambiar la contraseña',
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {},
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Descripción del error.' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Sin sesión activa',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
        },
      },
      ValidationError: {
        description: 'Datos inválidos (error de validación Zod)',
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
        },
      },
    },
  },
  paths: {
    '/users': {
      get: {
        summary: 'Listar todos los usuarios',
        description:
          'Devuelve id, nombre y email de todos los usuarios registrados, ordenados por nombre.',
        tags: ['Usuarios'],
        responses: {
          '200': {
            description: 'Lista de usuarios',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/UserItem' },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        summary: 'Crear un usuario',
        description:
          'Crea un nuevo usuario. La contraseña se hashea con bcrypt (12 rondas) antes de guardarse.',
        tags: ['Usuarios'],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateUserBody' } },
          },
        },
        responses: {
          '201': {
            description: 'Usuario creado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/UserItem' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '409': {
            description: 'Email ya registrado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '422': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/users/{id}': {
      put: {
        summary: 'Editar un usuario',
        description:
          'Actualiza nombre y email. Si el campo password viene vacío, el hash existente no se toca.',
        tags: ['Usuarios'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ObjectId del usuario en MongoDB',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateUserBody' } },
          },
        },
        responses: {
          '200': {
            description: 'Usuario actualizado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/UserItem' },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '409': {
            description: 'Email ya usado por otro usuario',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '422': { $ref: '#/components/responses/ValidationError' },
        },
      },
      delete: {
        summary: 'Eliminar un usuario',
        description:
          'Elimina al usuario y sus sesiones/cuentas asociadas (cascada definida en el schema Prisma). No se puede eliminar al propio usuario logueado.',
        tags: ['Usuarios'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'ObjectId del usuario en MongoDB',
          },
        ],
        responses: {
          '200': {
            description: 'Usuario eliminado',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': {
            description: 'Intento de autoeliminación',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    '/auth/signin': {
      post: {
        summary: 'Iniciar sesión',
        description:
          'Manejado por Auth.js v5. Acepta credenciales (email + password) o inicia el flujo OAuth de Google. No se interactúa directamente — usá el formulario de /login.',
        tags: ['Autenticación'],
        responses: {
          '200': { description: 'Sesión creada (cookie httpOnly de JWT)' },
          '401': { description: 'Credenciales incorrectas' },
        },
      },
    },
    '/auth/signout': {
      post: {
        summary: 'Cerrar sesión',
        description: 'Manejado por Auth.js v5. Invalida la cookie de sesión.',
        tags: ['Autenticación'],
        responses: {
          '200': { description: 'Sesión cerrada' },
        },
      },
    },
  },
}

export function GET() {
  return NextResponse.json(spec)
}
