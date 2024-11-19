import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req) {
  const data = await req.json()
  const telegramId = data.telegramId
  const platform = data.platform
  const reward = data.reward

  try {
    const existingClaim = await prisma.socialReward.findFirst({
      where: {
        telegramId,
        platform
      }
    })

    if (existingClaim) {
      return NextResponse.json({ error: 'Reward already claimed' }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.socialReward.create({
        data: {
          telegramId,
          platform,
          reward,
          claimedAt: new Date()
        }
      })

      const updatedUser = await tx.user.update({
        where: { telegramId },
        data: {
          points: { increment: reward },
          lastSeen: new Date()
        }
      })

      return updatedUser
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to process reward:', error)
    return NextResponse.json({ error: 'Failed to process reward' }, { status: 500 })
  }
}
