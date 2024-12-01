import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { telegramId, points } = await req.json()

    const user = await prisma.user.update({
      where: { telegramId },
      data: {
        points: { increment: points }
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to increase points' }, { status: 500 })
  }
}
