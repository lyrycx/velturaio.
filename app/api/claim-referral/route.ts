import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { telegramId, referrerId } = data

    const user = await prisma.user.update({
      where: { telegramId },
      data: {
        points: { increment: 50000 }
      }
    })

    const referrer = await prisma.user.update({
      where: { telegramId: referrerId },
      data: {
        points: { increment: 50000 }
      }
    })

    return NextResponse.json({ user, referrer })
  } catch (error) {
    return NextResponse.json({ error: 'Referral işlemi başarısız' }, { status: 500 })
  }
}
