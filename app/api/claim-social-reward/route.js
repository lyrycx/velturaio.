import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { telegramId, platform, reward } = await req.json()

    const user = await prisma.user.update({
      where: { telegramId },
      data: {
        points: { increment: reward }
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Ödül alma başarısız' }, { status: 500 })
  }
}
