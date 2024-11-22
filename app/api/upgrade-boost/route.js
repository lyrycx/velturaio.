import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { telegramId, level, cost } = await req.json()

    const user = await prisma.user.findUnique({
      where: { telegramId }
    })

    if (!user || user.points < cost) {
      return NextResponse.json({ error: 'Yetersiz bakiye' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { telegramId },
      data: {
        points: { decrement: cost },
        autoBoostLevel: level
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Boost yükseltme hatası:', error)
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 })
  }
}
