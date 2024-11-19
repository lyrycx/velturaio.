import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

<<<<<<< HEAD
interface TelegramUser {
  id: number
  username?: string
  first_name?: string
  last_name?: string
}

export async function POST(req: Request) {
  try {
    const data: TelegramUser = await req.json()
=======
export async function POST(req) {
  try {
    const data = await req.json()
>>>>>>> b06b03dcdeb90af6469a1553308b9a611f3abd39
    const { id, username, first_name, last_name } = data

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
