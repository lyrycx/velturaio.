import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    
    // Parse the request body safely
    let userData
    try {
      userData = JSON.parse(body)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON data' }, { status: 400 })
    }

    // Validate required fields
    if (!userData?.id) {
      return NextResponse.json({ error: 'Missing required user data' }, { status: 400 })
    }

    // Create or update user
    const user = await prisma.user.upsert({
      where: { telegramId: userData.id },
      update: {
        username: userData.username || '',
        firstName: userData.first_name || '',
        lastName: userData.last_name || ''
      },
      create: {
        telegramId: userData.id,
        username: userData.username || '',
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        points: 0,
        referralCount: 0,
        autoBoostLevel: 1
      }
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('User processing error:', error)
    return NextResponse.json({ error: 'Failed to process user' }, { status: 500 })
  }
}
