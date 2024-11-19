import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const data = await req.json()
    const { telegramId, referrerId } = data

    // Update referrer's stats
    const updatedReferrer = await prisma.user.update({
      where: { telegramId: referrerId },
      data: {
        points: { increment: 50000 },
        referralCount: { increment: 1 }
      }
    })

    return NextResponse.json(updatedReferrer)
  } catch (error) {
    console.error('Failed to process referral:', error)
    return NextResponse.json({ error: 'Failed to process referral' }, { status: 500 })
  }
}
