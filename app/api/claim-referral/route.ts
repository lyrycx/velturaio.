import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { telegramId, referrerId } = await req.json()

    const referrer = await prisma.user.update({
      where: { telegramId: referrerId },
      data: {
        points: { increment: 1000 },
        referralCount: { increment: 1 }
      }
    })

    return NextResponse.json(referrer)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process referral' }, { status: 500 })
  }
}
