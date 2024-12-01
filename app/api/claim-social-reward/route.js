import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { telegramId, platform } = await req.json()

    const reward = await prisma.socialReward.create({
      data: {
        telegramId,
        platform,
        reward: 100
      }
    })

    const user = await prisma.user.update({
      where: { telegramId },
      data: {
        points: { increment: reward.reward }
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to claim reward' }, { status: 500 })
  }
}
