// Promueve un usuario a admin y deja al resto como `user`.
// Uso: node scripts/set-admin.mjs [email]  (requiere DATABASE_URL en el entorno)
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const ADMIN_EMAIL = (process.argv[2] ?? 'jfjerefernandez@gmail.com').toLowerCase().trim()

async function main() {
  const admin = await prisma.user.updateMany({
    where: { email: ADMIN_EMAIL },
    data: { role: 'admin' },
  })
  const rest = await prisma.user.updateMany({
    where: { email: { not: ADMIN_EMAIL } },
    data: { role: 'user' },
  })

  if (admin.count === 0) {
    console.log(`⚠ No existe ningún usuario con email ${ADMIN_EMAIL}. Registrate primero y volvé a correr el script.`)
  } else {
    console.log(`✓ ${ADMIN_EMAIL} ahora es admin.`)
  }
  console.log(`✓ ${rest.count} usuario(s) restantes seteados como "user".`)
}

main()
  .catch((err) => {
    console.error('Error:', err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
