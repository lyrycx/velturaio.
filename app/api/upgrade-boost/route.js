import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const data = await req.json()
    const telegramId = data.telegramId
    const level = data.level
    const cost = data.cost

    const user = await prisma.user.update({
      where: { telegramId },
      data: {
        points: { decrement: cost },
        autoBoostLevel: level,
        lastSeen: new Date()
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to upgrade boost:', error)
    return NextResponse.json({ error: 'Failed to upgrade boost' }, { status: 500 })
  }
}
