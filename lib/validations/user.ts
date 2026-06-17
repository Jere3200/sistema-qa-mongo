import { z } from 'zod'

export const createUserSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido'),
  email: z.string().trim().toLowerCase().email('Ingresá un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const updateUserSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido'),
  email: z.string().trim().toLowerCase().email('Ingresá un email válido'),
  password: z.union([z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'), z.literal('')]),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
