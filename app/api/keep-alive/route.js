import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { telegramId } = await req.json()
    
    const user = await prisma.user.update({
      where: { telegramId },
      data: {
        updatedAt: new Date()
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user activity' }, { status: 500 })
  }
}
