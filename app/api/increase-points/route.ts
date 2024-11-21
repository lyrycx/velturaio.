import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { telegramId, points } = await req.json()

    const updatedUser = await prisma.user.update({
      where: { telegramId },
      data: {
        points: { increment: points },
        lastSeen: new Date()
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Mining hatası:', error)
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 })
  }
}
