import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const data = await req.json()
    const telegramId = data.telegramId

    const user = await prisma.user.update({
      where: { telegramId },
      data: { lastSeen: new Date() }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Keep-alive failed:', error)
    return NextResponse.json({ error: 'Keep-alive failed' }, { status: 500 })
  }
}
