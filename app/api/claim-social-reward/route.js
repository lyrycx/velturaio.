import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { telegramId, platform, reward } = await req.json()

    const user = await prisma.user.findUnique({
      where: { telegramId }
    })

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    const updatedUser = await prisma.user.update({
      where: { telegramId },
      data: {
        points: { increment: reward },
        lastSeen: new Date()
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Sosyal medya ödülü hatası:', error)
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 })
  }
}
