import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const data = await req.json()
    const { id, username, first_name, last_name } = data

    if (!id) {
      return NextResponse.json({ error: 'Telegram ID is required' }, { status: 400 })
    }

    const user = await prisma.user.upsert({
      where: { 
        telegramId: id 
      },
      update: { 
        lastSeen: new Date(),
        username: username || '',
        firstName: first_name || '',
        lastName: last_name || ''
      },
      create: {
        telegramId: id,
        username: username || '',
        firstName: first_name || '',
        lastName: last_name || '',
        points: 0,
        referralCount: 0,
        autoBoostLevel: 1,
        lastSeen: new Date()
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Failed to process user:', error)
    return NextResponse.json({ error: 'Failed to process user' }, { status: 500 })
  }
}
