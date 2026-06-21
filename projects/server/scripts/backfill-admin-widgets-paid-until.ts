/**
 * Одноразовый бэкфилл: для всех виджетов в проектах админов выставить paidUntil = null
 * (бессрочно/grandfather), чтобы ранее созданные виджеты админа не истекали.
 * Идемпотентен. Запуск: cd projects/server && DATABASE_URL=... npx ts-node scripts/backfill-admin-widgets-paid-until.ts
 */
import { PrismaService } from '../src/prisma.service'
import { ADMIN_EMAILS } from '../src/common/admin'

async function main() {
  const prisma = new PrismaService()
  await prisma.$connect()
  try {
    const admins = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'ADMIN' },
          { email: { in: ADMIN_EMAILS, mode: 'insensitive' } }
        ]
      },
      select: { id: true, email: true }
    })
    const adminIds = admins.map(a => a.id)
    console.log(`Найдено админов: ${admins.length} (${admins.map(a => a.email).join(', ')})`)
    if (adminIds.length === 0) {
      console.log('Админов нет — нечего бэкфиллить.')
      return
    }
    const res = await prisma.widget.updateMany({
      where: { project: { userId: { in: adminIds } } },
      data: { paidUntil: null }
    })
    console.log(`Обновлено виджетов (paidUntil = null): ${res.count}`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
