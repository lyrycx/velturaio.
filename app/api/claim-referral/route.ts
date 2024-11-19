import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { telegramId, platform, reward } = await req.json()

  try {
    // Check if reward was already claimed
    const existingClaim = await prisma.socialReward.findFirst({
      where: {
        telegramId: telegramId,
        platform: platform
      }
    })

    if (existingClaim) {
      return NextResponse.json({ error: 'Reward already claimed' }, { status: 400 })
    }

    // Start a transaction to ensure both operations complete
    const result = await prisma.$transaction(async (tx) => {
      // Create reward claim record
      await tx.socialReward.create({
        data: {
          telegramId: telegramId,
          platform: platform,
          reward: reward,
          claimedAt: new Date()
        }
      })

      // Update user points
      const updatedUser = await tx.user.update({
        where: { telegramId: telegramId },
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
