import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const userData = await req.json()

        const user = await prisma.user.upsert({
            where: { telegramId: userData.id },
            update: {
                username: userData.username || '',
                firstName: userData.first_name || 'Player',
                lastName: userData.last_name || ''
            },
            create: {
                telegramId: userData.id,
                username: userData.username || '',
                firstName: userData.first_name || 'Player',
                lastName: userData.last_name || '',
                points: 0,
                friends: 0
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error processing user data:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
