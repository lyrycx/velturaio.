import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const { telegramId, platform } = await req.json()

        if (!telegramId || !platform) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
        }

        const user = await prisma.user.update({
            where: { telegramId },
            data: {
                points: { increment: 25000 }
            }
        })

        return NextResponse.json({ 
            success: true, 
            points: user.points,
            message: `Claimed ${platform} reward successfully!` 
        })
    } catch (error) {
        console.error('Error claiming social reward:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
