import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
    try {
        const { telegramId, platform } = await req.json()

        if (!telegramId || !platform) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const updatedUser = await prisma.user.update({
            where: { telegramId: parseInt(telegramId) },
            data: { 
                points: { increment: 5000 },
                [`${platform.toLowerCase()}Claimed`]: true
            }
        })

        return NextResponse.json({ 
            success: true, 
            points: updatedUser.points 
        })
    } catch (error) {
        console.error('Error claiming social reward:', error)
        return NextResponse.json({ 
            error: 'Failed to process reward' 
        }, { status: 500 })
    }
}
