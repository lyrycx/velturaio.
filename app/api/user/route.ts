import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { id, username, first_name, last_name } = await req.json()

        const user = await prisma.user.upsert({
            where: { telegramId: id },
            update: {
                username,
                firstName: first_name,
                lastName: last_name
            },
            create: {
                telegramId: id,
                username,
                firstName: first_name,
                lastName: last_name,
                points: 0,
                totalMined: 0,
                friends: 0
            }
        })

        return NextResponse.json(user)
    } catch (error) {
        console.error('Error handling user:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
